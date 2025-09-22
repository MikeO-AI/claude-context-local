# Claude Context Local - MCP Setup Guide

This guide provides comprehensive instructions for setting up the claude-context-local MCP server with Claude Code.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] macOS, Linux, or WSL2 on Windows
- [ ] Node.js 18+ and pnpm installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Ollama installed and running
- [ ] Claude Code desktop app

## 🚀 Installation Methods

### Method 1: Local Repository (Recommended for Development)

This method gives you full control and allows modifications.

#### Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/MikeO-AI/claude-context-local.git
cd claude-context-local

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Validate your setup
node validate-mcp-setup.js
```

#### Step 2: Configure Claude Code

Add to your Claude Code config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

**Important**: Replace `/absolute/path/to/claude-context-local` with your actual path!

### Method 2: NPX Command (Coming Soon)

Once published to npm, you'll be able to use:

```bash
# Note: Not yet available - package needs to be published first
claude mcp add claude-context-local \
  -e EMBEDDING_PROVIDER=Ollama \
  -e OLLAMA_MODEL=DC1LEX/nomic-embed-text-v1.5-multimodal \
  -e POSTGRES_DATABASE=embeddings \
  -- npx @mikeo-ai/claude-context-local-mcp@latest
```

### Method 3: Global NPM Install (Coming Soon)

```bash
# Note: Not yet available - package needs to be published first
npm install -g @mikeo-ai/claude-context-local-mcp

# Then add to Claude Code config:
{
  "mcpServers": {
    "claude-context-local": {
      "command": "claude-context-local-mcp",
      "env": {
        "EMBEDDING_PROVIDER": "Ollama",
        "OLLAMA_MODEL": "DC1LEX/nomic-embed-text-v1.5-multimodal",
        "POSTGRES_DATABASE": "embeddings"
      }
    }
  }
}
```

## 🔧 Environment Setup

### 1. PostgreSQL Setup

```bash
# macOS
brew install postgresql@14 pgvector
brew services start postgresql@14

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo apt install postgresql-14-pgvector

# Create database and extension
psql -U postgres << EOF
CREATE DATABASE embeddings;
\c embeddings
CREATE EXTENSION IF NOT EXISTS vector;
EOF
```

### 2. Ollama Setup

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# In another terminal, pull the embedding model
ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
```

### 3. Verify Setup

Run the validation script:

```bash
node validate-mcp-setup.js
```

You should see:
```
✅ PostgreSQL installed
✅ pgvector extension available
✅ Database "embeddings" exists with vector extension
✅ Ollama running
✅ Ollama model DC1LEX/nomic-embed-text-v1.5-multimodal installed
✅ MCP server built and ready
✅ Claude Code configuration found
```

## 🎯 Testing the MCP Server

### Manual Test (Outside Claude)

```bash
# Test the MCP server directly
cd claude-context-local
node packages/mcp/dist/index-postgres.js

# You should see:
# MCP Server running on stdio
```

### Test in Claude Code

1. Restart Claude Code after updating configuration
2. Open Claude Code settings to verify MCP is loaded
3. In a conversation, try:
   - "Index my project at /path/to/project"
   - "Search for authentication logic"

## 📊 Configuration Options

### Basic Configuration (Required)

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_PROVIDER` | `Ollama` | Always use "Ollama" for local |
| `OLLAMA_MODEL` | `DC1LEX/nomic-embed-text-v1.5-multimodal` | Multimodal embedding model |
| `POSTGRES_DATABASE` | `embeddings` | Database name for vectors |

### Advanced Configuration (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `OLLAMA_KEEP_ALIVE` | `5m` | Model memory retention |
| `SPLITTER_TYPE` | `ast` | Code splitter: "ast" or "langchain" |
| `CHUNK_SIZE` | `2500` | Max chunk size for indexing |
| `CHUNK_OVERLAP` | `300` | Overlap between chunks |

## 🐳 Docker Deployment

For production or isolated environments:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: embeddings
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: securepass
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

  mcp-server:
    build: .
    depends_on:
      - postgres
      - ollama
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PASSWORD: securepass
      OLLAMA_HOST: http://ollama:11434
    stdin_open: true
    tty: true

volumes:
  postgres_data:
  ollama_data:
```

## ❓ Troubleshooting

### MCP Not Showing in Claude Code

1. Check configuration file syntax:
```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
```

2. Verify absolute path is correct:
```bash
ls -la /your/path/to/claude-context-local/packages/mcp/dist/index-postgres.js
```

3. Check Claude Code logs:
   - Open Claude Code Developer Tools: `Cmd+Option+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux)
   - Check Console tab for errors

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -d embeddings -c "SELECT version();"

# Check if vector extension is installed
psql -U postgres -d embeddings -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Ollama Issues

```bash
# Check Ollama is running
curl http://localhost:11434/api/version

# List installed models
curl http://localhost:11434/api/tags

# Re-pull model if needed
ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal
```

### Build Issues

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build

# Verify build output exists
ls -la packages/mcp/dist/
```

## 🔍 Validation Script

Always run the validation script before reporting issues:

```bash
node validate-mcp-setup.js
```

This checks:
- PostgreSQL installation and configuration
- pgvector extension availability
- Database and vector extension setup
- Ollama service status
- Required model availability
- MCP build status
- Claude Code configuration

## 📚 Additional Resources

- [PostgreSQL pgvector Documentation](https://github.com/pgvector/pgvector)
- [Ollama Documentation](https://ollama.ai/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude/docs/mcp)

## 🆘 Getting Help

If you encounter issues:

1. Run `node validate-mcp-setup.js` and fix any reported issues
2. Check the troubleshooting section above
3. Search existing [GitHub Issues](https://github.com/MikeO-AI/claude-context-local/issues)
4. Create a new issue with:
   - Output of validation script
   - Your configuration (remove passwords)
   - Error messages from Claude Code console
   - Steps to reproduce

## 🎉 Success Indicators

You know your setup is working when:

1. ✅ Validation script shows all green checkmarks
2. ✅ Claude Code shows "claude-context-local" in available tools
3. ✅ You can index a codebase without errors
4. ✅ Search queries return relevant results
5. ✅ No external API calls are made (check network traffic)

---

**Remember**: This is a 100% local solution. No data leaves your machine!