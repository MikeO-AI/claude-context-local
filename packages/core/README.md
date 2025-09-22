# @mikeo-ai/claude-context-local-core

The core indexing engine for claude-context-local - a privacy-first, 100% local code search and analysis tool using PostgreSQL + pgvector and Ollama embeddings.

[![npm version](https://img.shields.io/npm/v/@mikeo-ai/claude-context-local-core.svg)](https://www.npmjs.com/package/@mikeo-ai/claude-context-local-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **100% Local Processing**: All embeddings and searches happen on your machine
- **PostgreSQL + pgvector**: Enterprise-grade vector storage without cloud dependencies
- **Ollama Integration**: Free, open-source embedding models (no API keys!)
- **Privacy-First**: Your code never leaves your computer
- **Fast Search**: 12ms average query time
- **Multiple Splitters**: AST-based and LangChain text splitters
- **Incremental Indexing**: Efficient updates with merkle tree synchronization

## 📦 Installation

```bash
npm install @mikeo-ai/claude-context-local-core
```

## 🔧 Usage

### Basic Setup

```typescript
import {
  Context,
  PostgresVectorDatabase,
  AstCodeSplitter
} from '@mikeo-ai/claude-context-local-core';

// Configure PostgreSQL with pgvector
const vectorDb = new PostgresVectorDatabase({
  host: 'localhost',
  port: 5432,
  database: 'embeddings',
  user: 'postgres',
  password: 'postgres'
});

// Initialize context with local embeddings
const context = new Context({
  vectorDatabase: vectorDb,
  embeddingProvider: 'Ollama',
  ollamaModel: 'DC1LEX/nomic-embed-text-v1.5-multimodal',
  codeSplitter: new AstCodeSplitter()
});
```

### Index a Codebase

```typescript
// Index your project
const stats = await context.indexCodebase('/path/to/your/project');
console.log(`Indexed ${stats.indexedFiles} files, ${stats.totalChunks} chunks`);
```

### Search Code

```typescript
// Semantic search through your code
const results = await context.semanticSearch(
  '/path/to/your/project',
  'authentication logic',
  10, // limit
  0.7  // similarity threshold
);

results.forEach(result => {
  console.log(`${result.relativePath}:${result.startLine}`);
  console.log(`Similarity: ${result.score}`);
  console.log(result.content);
});
```

## 🏗️ Architecture

### Vector Databases

- **PostgresVectorDatabase**: Local PostgreSQL with pgvector extension (recommended)
- **MilvusVectorDatabase**: Original Milvus support (requires cloud/docker)
- **MilvusRestfulVectorDatabase**: RESTful API for Milvus

### Embedding Providers

- **OllamaEmbedding**: Local Ollama models (recommended for privacy)
- **OpenAIEmbedding**: OpenAI API (requires API key)
- **VoyageAIEmbedding**: VoyageAI API (requires API key)
- **GeminiEmbedding**: Google Gemini API (requires API key)

### Code Splitters

- **AstCodeSplitter**: Syntax-aware splitting using AST parsing
- **LangChainCodeSplitter**: Language-aware text splitting

## ⚙️ Configuration

### Environment Variables

```bash
# Embedding Provider (use Ollama for local)
EMBEDDING_PROVIDER=Ollama
OLLAMA_MODEL=DC1LEX/nomic-embed-text-v1.5-multimodal
OLLAMA_HOST=http://localhost:11434

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=embeddings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Optional: Splitter Configuration
SPLITTER_TYPE=ast  # or 'langchain'
CHUNK_SIZE=2500
CHUNK_OVERLAP=300
```

## 🔄 Migration from Original

If migrating from the original @zilliz/claude-context-core:

```typescript
// Old (cloud-based)
import { Context, MilvusVectorDatabase } from '@zilliz/claude-context-core';
const context = new Context({
  vectorDatabase: new MilvusVectorDatabase({ /* Milvus cloud config */ }),
  embeddingProvider: 'OpenAI',
  openAIApiKey: 'sk-...'
});

// New (100% local)
import { Context, PostgresVectorDatabase } from '@mikeo-ai/claude-context-local-core';
const context = new Context({
  vectorDatabase: new PostgresVectorDatabase({ /* local Postgres */ }),
  embeddingProvider: 'Ollama',
  ollamaModel: 'DC1LEX/nomic-embed-text-v1.5-multimodal'
});
```

## 📊 Performance

| Operation | Cloud Version | Local Version |
|-----------|---------------|---------------|
| Embedding Generation | 200-500ms | 50-100ms |
| Vector Search | 60-250ms | 12ms |
| Index 1000 files | ~5 min | ~2 min |
| Storage per 1M chunks | Cloud costs | Free (local disk) |

## 🔗 Related Packages

- [@mikeo-ai/claude-context-local-mcp](https://www.npmjs.com/package/@mikeo-ai/claude-context-local-mcp) - MCP server for Claude Code integration
- [Main Repository](https://github.com/MikeO-AI/claude-context-local) - Full documentation and examples

## 🤝 Contributing

Contributions welcome! This is a community project focused on privacy and local-first development.

## 📄 License

MIT © 2025 MikeO-AI

Based on original work by Zilliz, also MIT licensed.

---

**Privacy Guarantee**: This package performs ALL operations locally. No telemetry, no external API calls (except optional cloud providers if explicitly configured), no data collection.