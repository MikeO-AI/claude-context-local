import { Client } from 'pg';
import {
    VectorDocument,
    SearchOptions,
    VectorSearchResult,
    VectorDatabase,
    HybridSearchRequest,
    HybridSearchOptions,
    HybridSearchResult,
} from './types';

export interface PostgresConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean;
}

export class PostgresVectorDatabase implements VectorDatabase {
    private config: PostgresConfig;
    private client: Client | null = null;
    private initializationPromise: Promise<void>;

    constructor(config: PostgresConfig) {
        this.config = {
            host: config.host || 'localhost',
            port: config.port || 5432,
            database: config.database || 'embeddings',
            user: config.user || 'postgres',
            password: config.password || 'postgres',
            ssl: config.ssl || false
        };

        this.initializationPromise = this.initialize();
    }

    private async initialize(): Promise<void> {
        console.log('🔌 Connecting to PostgreSQL at:', `${this.config.host}:${this.config.port}`);
        this.client = new Client(this.config);
        await this.client.connect();
        console.log('✅ Connected to PostgreSQL database');

        // Ensure collections metadata table exists
        await this.ensureCollectionsTable();
    }

    private async ensureCollectionsTable(): Promise<void> {
        if (!this.client) return;

        await this.client.query(`
            CREATE TABLE IF NOT EXISTS collections (
                name TEXT PRIMARY KEY,
                dimension INTEGER,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
    }

    protected async ensureInitialized(): Promise<void> {
        await this.initializationPromise;
        if (!this.client) {
            throw new Error('PostgreSQL client not initialized');
        }
    }

    async createCollection(collectionName: string, dimension: number, description?: string): Promise<void> {
        await this.ensureInitialized();

        console.log('[PostgresDB] Creating collection:', collectionName);
        console.log('[PostgresDB] Collection dimension:', dimension);

        const tableName = this.sanitizeTableName(collectionName);

        // Create table with vector column
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id TEXT PRIMARY KEY,
                vector VECTOR(${dimension}),
                content TEXT,
                relative_path TEXT,
                start_line INTEGER,
                end_line INTEGER,
                file_extension TEXT,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;

        await this.client!.query(createTableQuery);

        // Create index for vector similarity search
        const createIndexQuery = `
            CREATE INDEX IF NOT EXISTS ${tableName}_vector_idx
            ON ${tableName}
            USING ivfflat (vector vector_cosine_ops)
        `;

        await this.client!.query(createIndexQuery);

        // Store collection metadata
        await this.client!.query(
            'INSERT INTO collections (name, dimension, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET dimension = $2, description = $3',
            [collectionName, dimension, description || '']
        );

        console.log(`[PostgresDB] ✅ Collection '${collectionName}' created successfully`);
    }

    async createHybridCollection(collectionName: string, dimension: number, description?: string): Promise<void> {
        // For PostgreSQL, hybrid collection is the same as regular collection
        await this.createCollection(collectionName, dimension, description);
    }

    async dropCollection(collectionName: string): Promise<void> {
        await this.ensureInitialized();

        const tableName = this.sanitizeTableName(collectionName);

        await this.client!.query(`DROP TABLE IF EXISTS ${tableName}`);
        await this.client!.query('DELETE FROM collections WHERE name = $1', [collectionName]);

        console.log(`[PostgresDB] Collection '${collectionName}' dropped`);
    }

    async hasCollection(collectionName: string): Promise<boolean> {
        await this.ensureInitialized();

        const result = await this.client!.query(
            'SELECT EXISTS(SELECT 1 FROM collections WHERE name = $1)',
            [collectionName]
        );

        return result.rows[0].exists;
    }

    async listCollections(): Promise<string[]> {
        await this.ensureInitialized();

        const result = await this.client!.query('SELECT name FROM collections ORDER BY name');
        return result.rows.map(row => row.name);
    }

    async insert(collectionName: string, documents: VectorDocument[]): Promise<void> {
        await this.ensureInitialized();

        const tableName = this.sanitizeTableName(collectionName);

        console.log(`[PostgresDB] Inserting ${documents.length} documents into '${collectionName}'`);

        // Batch insert for better performance
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        for (const doc of documents) {
            const vectorStr = '[' + doc.vector.join(',') + ']';
            placeholders.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6}, $${paramIndex+7})`);

            values.push(
                doc.id,
                vectorStr,
                doc.content,
                doc.relativePath,
                doc.startLine,
                doc.endLine,
                doc.fileExtension,
                JSON.stringify(doc.metadata || {})
            );

            paramIndex += 8;
        }

        const insertQuery = `
            INSERT INTO ${tableName} (id, vector, content, relative_path, start_line, end_line, file_extension, metadata)
            VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE SET
                vector = EXCLUDED.vector,
                content = EXCLUDED.content,
                relative_path = EXCLUDED.relative_path,
                start_line = EXCLUDED.start_line,
                end_line = EXCLUDED.end_line,
                file_extension = EXCLUDED.file_extension,
                metadata = EXCLUDED.metadata
        `;

        await this.client!.query(insertQuery, values);

        console.log(`[PostgresDB] ✅ Successfully inserted ${documents.length} documents`);
    }

    async insertHybrid(collectionName: string, documents: VectorDocument[]): Promise<void> {
        // For now, hybrid insert is the same as regular insert
        await this.insert(collectionName, documents);
    }

    async search(collectionName: string, queryVector: number[], options?: SearchOptions): Promise<VectorSearchResult[]> {
        await this.ensureInitialized();

        const tableName = this.sanitizeTableName(collectionName);
        const topK = options?.topK || 10;
        const threshold = options?.threshold || 0;

        console.log(`[PostgresDB] Searching in '${collectionName}' for top ${topK} results`);

        const vectorStr = '[' + queryVector.join(',') + ']';

        let query = `
            SELECT
                id,
                content,
                relative_path,
                start_line,
                end_line,
                file_extension,
                metadata,
                1 - (vector <=> $1::vector) as similarity
            FROM ${tableName}
            WHERE 1 - (vector <=> $1::vector) >= $2
        `;

        const params: any[] = [vectorStr, threshold];

        if (options?.filterExpr) {
            query += ` AND ${this.parseFilterExpression(options.filterExpr)}`;
        }

        query += ` ORDER BY vector <=> $1::vector LIMIT $${params.length + 1}`;
        params.push(topK);

        const result = await this.client!.query(query, params);

        return result.rows.map(row => ({
            document: {
                id: row.id,
                vector: [], // We don't return the vector for efficiency
                content: row.content,
                relativePath: row.relative_path,
                startLine: row.start_line,
                endLine: row.end_line,
                fileExtension: row.file_extension,
                metadata: row.metadata || {}
            },
            score: row.similarity
        }));
    }

    async hybridSearch(collectionName: string, searchRequests: HybridSearchRequest[], options?: HybridSearchOptions): Promise<HybridSearchResult[]> {
        // Simplified hybrid search implementation
        const denseRequest = searchRequests.find(req => req.anns_field === 'vector');

        if (denseRequest && Array.isArray(denseRequest.data)) {
            return this.search(collectionName, denseRequest.data as number[], {
                topK: options?.limit || 10,
                filterExpr: options?.filterExpr
            });
        }

        return [];
    }

    async delete(collectionName: string, ids: string[]): Promise<void> {
        await this.ensureInitialized();

        const tableName = this.sanitizeTableName(collectionName);

        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
        const deleteQuery = `DELETE FROM ${tableName} WHERE id IN (${placeholders})`;

        await this.client!.query(deleteQuery, ids);

        console.log(`[PostgresDB] Deleted ${ids.length} documents from '${collectionName}'`);
    }

    async query(collectionName: string, filter: string, outputFields: string[], limit?: number): Promise<Record<string, any>[]> {
        await this.ensureInitialized();

        const tableName = this.sanitizeTableName(collectionName);
        const selectedFields = outputFields.map(f => this.camelToSnake(f)).join(', ');
        const queryLimit = limit || 100;

        const whereClause = this.parseFilterExpression(filter);

        const queryStr = `
            SELECT ${selectedFields}
            FROM ${tableName}
            WHERE ${whereClause}
            LIMIT $1
        `;

        const result = await this.client!.query(queryStr, [queryLimit]);

        return result.rows.map(row => {
            const doc: Record<string, any> = {};
            outputFields.forEach(field => {
                const dbField = this.camelToSnake(field);
                doc[field] = row[dbField];
            });
            return doc;
        });
    }

    async checkCollectionLimit(): Promise<boolean> {
        await this.ensureInitialized();
        // PostgreSQL doesn't have collection limits like cloud services
        return true;
    }

    // Helper methods
    private sanitizeTableName(name: string): string {
        // Convert collection name to valid PostgreSQL table name
        return `collection_${name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    }

    private parseFilterExpression(filter: string): string {
        // Simple filter parser - basic SQL injection prevention
        let parsed = filter
            .replace(/relativePath/g, 'relative_path')
            .replace(/startLine/g, 'start_line')
            .replace(/endLine/g, 'end_line')
            .replace(/fileExtension/g, 'file_extension');

        // Basic SQL injection prevention
        parsed = parsed.replace(/;/g, '');

        return parsed || '1=1';
    }

    private camelToSnake(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    async close(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
            console.log('[PostgresDB] Connection closed');
        }
    }
}
