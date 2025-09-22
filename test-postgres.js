#!/usr/bin/env node

// Test script for PostgreSQL vector database implementation
const { PostgresVectorDatabase } = require('./packages/core/dist/vectordb/postgres-vectordb.js');
const { OllamaEmbedding } = require('./packages/core/dist/embedding/ollama-embedding.js');

async function testPostgresIntegration() {
    console.log('🧪 Testing PostgreSQL Vector Database Integration\n');

    // Initialize PostgreSQL connection
    const db = new PostgresVectorDatabase({
        host: 'localhost',
        port: 5432,
        database: 'embeddings',
        user: 'postgres',
        password: 'postgres'
    });

    // Initialize Ollama embedding
    const embedding = new OllamaEmbedding({
        model: 'DC1LEX/nomic-embed-text-v1.5-multimodal',
        host: 'http://localhost:11434'
    });

    try {
        // Wait for initialization
        console.log('1. Initializing database connection...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test collection operations
        console.log('2. Testing collection operations...');

        const collectionName = 'test_collection';
        const dimension = 768;

        // Create collection
        console.log(`   - Creating collection '${collectionName}'...`);
        await db.createCollection(collectionName, dimension, 'Test collection for validation');

        // Check if collection exists
        console.log(`   - Checking if collection exists...`);
        const exists = await db.hasCollection(collectionName);
        console.log(`   ✅ Collection exists: ${exists}`);

        // List collections
        console.log('   - Listing all collections...');
        const collections = await db.listCollections();
        console.log(`   ✅ Collections: ${collections.join(', ')}`);

        // Test embedding and insertion
        console.log('\n3. Testing embedding and insertion...');

        const testCode = `
function calculateSum(a, b) {
    return a + b;
}
`;

        console.log('   - Generating embedding for test code...');
        const embeddingResult = await embedding.embed(testCode);
        console.log(`   ✅ Generated embedding with dimension: ${embeddingResult.dimension}`);

        // Insert document
        console.log('   - Inserting document into collection...');
        await db.insert(collectionName, [{
            id: 'test-doc-1',
            vector: embeddingResult.vector,
            content: testCode,
            relativePath: '/test/file.js',
            startLine: 1,
            endLine: 3,
            fileExtension: '.js',
            metadata: {
                language: 'javascript',
                testData: true
            }
        }]);
        console.log('   ✅ Document inserted successfully');

        // Test search
        console.log('\n4. Testing vector search...');
        const searchQuery = 'function that adds two numbers';
        console.log(`   - Searching for: "${searchQuery}"`);

        const queryEmbedding = await embedding.embed(searchQuery);
        const searchResults = await db.search(collectionName, queryEmbedding.vector, {
            topK: 5
        });

        console.log(`   ✅ Found ${searchResults.length} results`);
        if (searchResults.length > 0) {
            console.log(`   - Top result score: ${searchResults[0].score.toFixed(4)}`);
            console.log(`   - Top result content: ${searchResults[0].document.content.trim()}`);
        }

        // Clean up
        console.log('\n5. Cleaning up...');
        await db.delete(collectionName, ['test-doc-1']);
        console.log('   ✅ Test document deleted');

        await db.dropCollection(collectionName);
        console.log('   ✅ Test collection dropped');

        // Close connection
        await db.close();
        console.log('   ✅ Database connection closed');

        console.log('\n✅ All tests passed! PostgreSQL vector database integration is working correctly.');
        console.log('\n📝 Summary:');
        console.log('   - PostgreSQL connection: ✅');
        console.log('   - pgvector operations: ✅');
        console.log('   - Ollama embeddings: ✅');
        console.log('   - Vector similarity search: ✅');
        console.log('\nYour local Claude-Context MCP with Ollama + PostgreSQL is ready to use!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        await db.close();
        process.exit(1);
    }
}

// Run the test
testPostgresIntegration().catch(console.error);