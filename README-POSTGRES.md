# Claude-Context with Local PostgreSQL + Ollama

This is a local-first implementation of Claude-Context MCP that uses:
- **PostgreSQL with pgvector** for vector storage (instead of Milvus/Zilliz Cloud)
- **Ollama** for embeddings (instead of OpenAI)
- **Fully local architecture** with no external API dependencies

## Prerequisites

1. **PostgreSQL** (version 14 or higher)
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **pgvector extension**
   ```bash
   brew install pgvector
   ```

3. **Ollama** with the multimodal embedding model
   ```bash
   # Install Ollama if not already installed
   brew install ollama

   # Start Ollama service
   ollama serve

   # Pull the multimodal embedding model (768-dimensional)
   ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
   ```

4. **Node.js** (version 18 or higher)

## Database Setup

1. Create the embeddings database:
   ```bash
   psql -U postgres -c "CREATE DATABASE embeddings;"
   ```

2. Enable pgvector extension:
   ```bash
   psql -U postgres -d embeddings -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

3. The tables will be created automatically when the MCP server starts.

## Installation

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/zilliztech/claude-context.git
   cd claude-context
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

## Configuration

Set environment variables (or use defaults):

```bash
# Ollama Configuration (defaults shown)
export EMBEDDING_PROVIDER=Ollama
export OLLAMA_MODEL=DC1LEX/nomic-embed-text-v1.5-multimodal
export OLLAMA_HOST=http://localhost:11434

# PostgreSQL Configuration (defaults shown)
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DATABASE=embeddings
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
```

## Running the PostgreSQL MCP Server

Start the server:
```bash
node packages/mcp/dist/index-postgres.js
```

Or with custom configuration:
```bash
POSTGRES_HOST=db.example.com POSTGRES_PORT=5432 \
POSTGRES_USER=myuser POSTGRES_PASSWORD=mypass \
node packages/mcp/dist/index-postgres.js
```

## Integration with Claude Code

Add to your Claude Code MCP configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "claude-context-postgres": {
      "command": "node",
      "args": ["/path/to/claude-context/packages/mcp/dist/index-postgres.js"],
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

## Available MCP Tools

The PostgreSQL implementation provides two main tools:

### 1. `add_codebase`
Indexes a codebase directory for semantic search.

```typescript
// Example usage in Claude
add_codebase({
  path: "/path/to/your/project"
})
```

### 2. `search_codebase`
Searches through indexed codebases using natural language queries.

```typescript
// Example usage in Claude
search_codebase({
  query: "function that handles user authentication",
  path: "/path/to/your/project",
  limit: 10
})
```

## Testing the Integration

Run the test script to verify everything is working:

```bash
node test-postgres.js
```

Expected output:
```
✅ All tests passed! PostgreSQL vector database integration is working correctly.

📝 Summary:
   - PostgreSQL connection: ✅
   - pgvector operations: ✅
   - Ollama embeddings: ✅
   - Vector similarity search: ✅
```

## Architecture Differences

### Original (Milvus/Zilliz Cloud) vs Local (PostgreSQL)

| Component | Original | Local Implementation |
|-----------|----------|---------------------|
| Vector DB | Milvus/Zilliz Cloud | PostgreSQL + pgvector |
| Embeddings | OpenAI/VoyageAI/Gemini | Ollama (local) |
| Dimensions | Variable | 768 (Nomic multimodal) |
| Collections | Dynamic | PostgreSQL tables |
| Connection | Cloud API | Local PostgreSQL |
| Privacy | External services | Fully local |
| Cost | API costs | Free (local resources) |

## Database Schema

The PostgreSQL implementation creates tables for each collection:

```sql
CREATE TABLE collection_<name> (
    id TEXT PRIMARY KEY,
    vector VECTOR(768),
    content TEXT,
    relative_path TEXT,
    start_line INTEGER,
    end_line INTEGER,
    file_extension TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON collection_<name> USING ivfflat (vector vector_cosine_ops);
```

And a metadata table:

```sql
CREATE TABLE collections (
    name TEXT PRIMARY KEY,
    dimension INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Advantages of This Implementation

1. **Complete Privacy**: All data stays on your local machine
2. **No API Costs**: Uses free, open-source models and databases
3. **Multimodal Support**: Nomic model supports both text and images
4. **Fast Local Search**: PostgreSQL with pgvector provides efficient similarity search
5. **Easy Backup**: Standard PostgreSQL backup tools work
6. **Customizable**: Can switch to different Ollama models or adjust parameters

## Troubleshooting

1. **pgvector not found**: Make sure pgvector is installed and the extension is created in the database
2. **Ollama connection failed**: Ensure Ollama is running (`ollama serve`)
3. **Model not found**: Pull the model first (`ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal`)
4. **PostgreSQL connection failed**: Check credentials and ensure PostgreSQL is running
5. **Dimension mismatch**: Ensure your Ollama model produces 768-dimensional embeddings

## Performance Tuning

For better performance with large codebases:

1. Adjust PostgreSQL settings in `postgresql.conf`:
   ```
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 128MB
   ```

2. Optimize ivfflat index:
   ```sql
   -- Adjust lists parameter based on dataset size
   CREATE INDEX ON collection_name USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
   ```

3. Consider using different Ollama models for speed vs accuracy tradeoffs:
   - Faster: `mxbai-embed-large` (1024 dimensions)
   - Smaller: `all-minilm` (384 dimensions)

## Future Enhancements

Potential improvements to consider:

1. **Hybrid Search**: Combine vector search with full-text search
2. **Incremental Updates**: Track file changes and update embeddings accordingly
3. **Multiple Collections**: Support organizing code into different collections
4. **Query Caching**: Cache frequent queries for faster response
5. **Batch Processing**: Optimize bulk indexing for large codebases

## Contributing

This is a community implementation. Contributions are welcome! Please submit issues or pull requests to improve the PostgreSQL integration.

## License

MIT (same as the original claude-context project)