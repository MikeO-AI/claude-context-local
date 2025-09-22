# @mikeo-ai/claude-context-local-mcp

A privacy-first MCP (Model Context Protocol) server that enables Claude and other AI assistants to index and search codebases using 100% local semantic search - no cloud APIs required.

[![npm version](https://img.shields.io/npm/v/@mikeo-ai/claude-context-local-mcp.svg)](https://www.npmjs.com/package/@mikeo-ai/claude-context-local-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **100% Local**: All processing happens on your machine - no external API calls
- **Privacy-First**: Your code never leaves your computer
- **Zero Cost**: No API fees or subscriptions required
- **PostgreSQL + pgvector**: Enterprise-grade vector storage
- **Ollama Embeddings**: Free, open-source embedding models
- **Fast Search**: 12ms average query time (5-20x faster than cloud solutions)
- **MCP Compatible**: Works with Claude Code and other MCP-enabled tools

## 📋 Prerequisites

1. **PostgreSQL with pgvector**
   ```bash
   # macOS
   brew install postgresql@14 pgvector
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib postgresql-14-pgvector
   ```

2. **Ollama**
   ```bash
   # macOS
   brew install ollama

   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh

   # Start Ollama and pull the model
   ollama serve
   ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
   ```

3. **Database Setup**
   ```bash
   psql -U postgres -c "CREATE DATABASE embeddings;"
   psql -U postgres -d embeddings -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

## 🎯 Quick Start

### Method 1: NPX (Easiest)

```bash
# Add to Claude Code using the MCP CLI
claude mcp add claude-context-local \
  -e EMBEDDING_PROVIDER=Ollama \
  -e POSTGRES_DATABASE=embeddings \
  -- npx @mikeo-ai/claude-context-local-mcp@latest

# Or run directly to test
npx @mikeo-ai/claude-context-local-mcp@latest
```

### Method 2: Global Install

```bash
# Install globally
npm install -g @mikeo-ai/claude-context-local-mcp

# Run the server
claude-context-local-mcp
```

### Method 3: Manual Configuration

Add to your Claude Code config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "claude-context-local": {
      "command": "npx",
      "args": ["@mikeo-ai/claude-context-local-mcp@latest"],
      "env": {
        "EMBEDDING_PROVIDER": "Ollama",
        "OLLAMA_MODEL": "DC1LEX/nomic-embed-text-v1.5-multimodal",
        "OLLAMA_HOST": "http://localhost:11434",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DATABASE": "embeddings",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "postgres"
      }
    }
  }
}
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_PROVIDER` | `Ollama` | Always use "Ollama" for local operation |
| `OLLAMA_MODEL` | `DC1LEX/nomic-embed-text-v1.5-multimodal` | Embedding model to use |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DATABASE` | `embeddings` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |

## 🔧 MCP Tools

This server provides two main tools:

### `add_codebase`
Index a codebase for semantic search:
```typescript
{
  "tool": "add_codebase",
  "arguments": {
    "path": "/path/to/your/project"
  }
}
```

### `search_codebase`
Search through indexed codebases:
```typescript
{
  "tool": "search_codebase",
  "arguments": {
    "query": "authentication logic",
    "path": "/path/to/your/project",
    "limit": 10
  }
}
```

## 🐳 Docker Support

```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: embeddings
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

## 🔍 Troubleshooting

### MCP Not Showing in Claude Code
- Verify configuration syntax: `cat ~/Library/Application Support/Claude/claude_desktop_config.json | jq .`
- Restart Claude Code after configuration changes

### Database Connection Issues
```bash
psql -U postgres -d embeddings -c "SELECT version();"
```

### Ollama Not Running
```bash
ollama serve
curl http://localhost:11434/api/version
```

## 🚦 Performance

- **Indexing Speed**: ~100 files/second
- **Search Latency**: 12ms average
- **Memory Usage**: <500MB typical
- **Storage**: ~1KB per code chunk

## 📊 Comparison with Original

| Feature | Original (Milvus/Cloud) | This Package (PostgreSQL/Local) |
|---------|------------------------|----------------------------------|
| Privacy | Data sent to cloud | 100% local |
| Cost | API fees | Free |
| Setup | Cloud accounts required | Local only |
| Speed | 60-250ms | 12ms |
| Internet | Required | Not required |

## 🔗 Links

- [GitHub Repository](https://github.com/MikeO-AI/claude-context-local)
- [Main Project Documentation](https://github.com/MikeO-AI/claude-context-local#readme)
- [Report Issues](https://github.com/MikeO-AI/claude-context-local/issues)

## 📄 License

MIT © 2025 MikeO-AI

Based on [claude-context](https://github.com/zilliztech/claude-context) by Zilliz, also MIT licensed.

---

**Privacy Notice**: This package processes all data locally on your machine. No telemetry, no external API calls, no data collection.