import { envManager } from "@zilliz/claude-context-core";

export interface ContextMcpConfig {
    name: string;
    version: string;
    // Embedding configuration
    embeddingProvider: 'OpenAI' | 'VoyageAI' | 'Gemini' | 'Ollama';
    embeddingModel: string;
    // Provider-specific configuration
    openaiApiKey?: string;
    openaiBaseUrl?: string;
    voyageApiKey?: string;
    geminiApiKey?: string;
    geminiBaseUrl?: string;
    // Ollama configuration
    ollamaModel?: string;
    ollamaHost?: string;
    // PostgreSQL configuration
    postgresHost?: string;
    postgresPort?: number;
    postgresDatabase?: string;
    postgresUser?: string;
    postgresPassword?: string;
}

export function createMcpConfig(): ContextMcpConfig {
    const config: ContextMcpConfig = {
        name: 'Context MCP Server',
        version: '1.0.0',
        // Embedding configuration
        embeddingProvider: (envManager.get('EMBEDDING_PROVIDER') as 'OpenAI' | 'VoyageAI' | 'Gemini' | 'Ollama') || 'Ollama',
        embeddingModel: getEmbeddingModelForProvider(envManager.get('EMBEDDING_PROVIDER') || 'Ollama'),
        // Provider-specific configuration
        openaiApiKey: envManager.get('OPENAI_API_KEY'),
        openaiBaseUrl: envManager.get('OPENAI_BASE_URL'),
        voyageApiKey: envManager.get('VOYAGEAI_API_KEY'),
        geminiApiKey: envManager.get('GEMINI_API_KEY'),
        geminiBaseUrl: envManager.get('GEMINI_BASE_URL'),
        // Ollama configuration
        ollamaModel: envManager.get('OLLAMA_MODEL'),
        ollamaHost: envManager.get('OLLAMA_HOST') || 'http://localhost:11434',
        // PostgreSQL configuration
        postgresHost: envManager.get('POSTGRES_HOST') || 'localhost',
        postgresPort: parseInt(envManager.get('POSTGRES_PORT') || '5432'),
        postgresDatabase: envManager.get('POSTGRES_DATABASE') || 'embeddings',
        postgresUser: envManager.get('POSTGRES_USER') || 'postgres',
        postgresPassword: envManager.get('POSTGRES_PASSWORD') || 'postgres',
    };

    return config;
}

function getEmbeddingModelForProvider(provider: string): string {
    switch (provider) {
        case 'OpenAI':
            return 'text-embedding-3-small';
        case 'VoyageAI':
            return 'voyage-3';
        case 'Gemini':
            return 'gemini-embedding-001';
        case 'Ollama':
            return 'DC1LEX/nomic-embed-text-v1.5-multimodal';
        default:
            return 'DC1LEX/nomic-embed-text-v1.5-multimodal';
    }
}

export function logConfigurationSummary(config: ContextMcpConfig): void {
    console.log(`[MCP] 🚀 Starting Context MCP Server`);
    console.log(`[MCP] Configuration Summary:`);
    console.log(`[MCP]   Server: ${config.name} v${config.version}`);
    console.log(`[MCP]   Embedding Provider: ${config.embeddingProvider}`);
    console.log(`[MCP]   Embedding Model: ${config.embeddingModel}`);
    console.log(`[MCP]   PostgreSQL: ${config.postgresHost}:${config.postgresPort}/${config.postgresDatabase}`);
}
