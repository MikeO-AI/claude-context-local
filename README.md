# claude-context-local

> **Project Philosophy**: This project maintains the full history of the original [claude-context](https://github.com/zilliztech/claude-context) for transparency and attribution, but represents a **divergent branch focused on privacy and local operation**. While the original continues toward cloud integration, we're committed to a **100% local, privacy-first approach**. Both projects serve different needs in the ecosystem.

A local-first implementation of claude-context MCP server that replaces cloud dependencies with local alternatives for complete privacy and zero API costs.

## < Key Features

- **100% Local**: No external API calls, all processing happens on your machine
- **PostgreSQL + pgvector**: Replaces Milvus/Zilliz Cloud with local PostgreSQL
- **Ollama Embeddings**: Uses free, open-source models instead of OpenAI
- **Privacy-First**: Your code never leaves your machine
- **Zero API Costs**: No subscription fees or usage charges
- **Multimodal Support**: Nomic embedding model supports text and images

## =� Quick Start

### Prerequisites

1. **Install PostgreSQL and pgvector**:
```bash
brew install postgresql@14 pgvector
brew services start postgresql@14
```

2. **Install and configure Ollama**:
```bash
brew install ollama
ollama serve  # Start in a separate terminal
ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
```

3. **Setup database**:
```bash
psql -U postgres -c "CREATE DATABASE embeddings;"
psql -U postgres -d embeddings -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Installation

```bash
# Clone the repository
git clone https://github.com/MikeO-AI/claude-context-local.git
cd claude-context-local

# Install dependencies
pnpm install

# Build the project
pnpm build

# Test the integration
node test-postgres.js
```

### Running the MCP Server

```bash
# Start with default settings (PostgreSQL on localhost, Ollama on localhost:11434)
node packages/mcp/dist/index-postgres.js

# Or with custom configuration
POSTGRES_HOST=your-db POSTGRES_PASSWORD=your-pass node packages/mcp/dist/index-postgres.js
```

## =' Configuration

### Claude Code Integration

Add to your Claude Code config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "claude-context-local": {
      "command": "node",
      "args": ["/absolute/path/to/claude-context-local/packages/mcp/dist/index-postgres.js"],
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

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_PROVIDER` | `Ollama` | Embedding provider (Ollama recommended) |
| `OLLAMA_MODEL` | `DC1LEX/nomic-embed-text-v1.5-multimodal` | Ollama model to use |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DATABASE` | `embeddings` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |

## =� Docker Setup (Optional)

For easier deployment, use Docker Compose:

```yaml
# docker-compose.yml
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
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    command: serve

volumes:
  postgres_data:
  ollama_data:
```

Then:
```bash
docker-compose up -d
docker exec -it claude-context-local_ollama_1 ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
```

## =� MCP Tools

### `add_codebase`
Index a codebase directory for semantic search:
```typescript
add_codebase({
  path: "/path/to/your/project"
})
```

### `search_codebase`
Search through indexed codebases:
```typescript
search_codebase({
  query: "authentication logic",
  path: "/path/to/your/project",
  limit: 10
})
```

## =� Comparison with Original

| Feature | Original (Milvus) | Local (PostgreSQL) |
|---------|-------------------|--------------------|
| Vector Database | Milvus/Zilliz Cloud | PostgreSQL + pgvector |
| Embeddings | OpenAI/VoyageAI | Ollama (local) |
| Privacy | Data sent to cloud | 100% local |
| Cost | API usage fees | Free |
| Setup | Cloud account required | Local installation |
| Internet | Required | Not required |
| Dimensions | Variable | 768 (configurable) |

## > Credits & Attribution

This project is based on [claude-context](https://github.com/zilliztech/claude-context) by [Zilliz](https://github.com/zilliztech), licensed under the MIT License.

### What's Changed
- Replaced Milvus/Zilliz Cloud with PostgreSQL + pgvector
- Replaced OpenAI embeddings with Ollama
- Added multimodal embedding support
- Removed all external API dependencies
- Added comprehensive PostgreSQL implementation

### Original Contributors
- [Zilliz Team](https://github.com/zilliztech) - Original claude-context implementation
- [Cheney Zhang](https://github.com/shanghaikid) - Original author

## =� Documentation

- [PostgreSQL Setup Guide](./README-POSTGRES.md) - Detailed PostgreSQL configuration
- [Test Script](./test-postgres.js) - Verify your installation
- [Original Documentation](https://github.com/zilliztech/claude-context) - Reference the original project

## = Troubleshooting

### Common Issues

1. **pgvector not found**
   ```bash
   brew install pgvector
   psql -U postgres -d embeddings -c "CREATE EXTENSION vector;"
   ```

2. **Ollama connection failed**
   ```bash
   ollama serve  # Start Ollama service
   ```

3. **Model not found**
   ```bash
   ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
   ```

## =� Roadmap

- [ ] SQLite support for simpler setup
- [ ] Additional Ollama model support
- [ ] Web UI for codebase management
- [ ] Incremental indexing
- [ ] Docker one-click deployment
- [ ] Support for more local embedding models

## > Contributing

Contributions are welcome! This is a community project aimed at providing a fully local alternative to cloud-based code context solutions.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Areas for Contribution
- Support for additional databases (SQLite, DuckDB)
- More embedding model integrations
- Performance optimizations
- Documentation improvements
- Testing and bug fixes

## =� License

MIT License - see [LICENSE](./LICENSE) for details.

This project includes code from [claude-context](https://github.com/zilliztech/claude-context) by Zilliz, also licensed under MIT.

## P Star History

If you find this project useful, please consider giving it a star!

---

Built with d for the community by [MikeO-AI](https://github.com/MikeO-AI)