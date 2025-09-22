#!/bin/bash

# Test script to validate the npm package works correctly

echo "🧪 Testing claude-context-local npm package"
echo "==========================================="
echo ""

# Test 1: Check if package exists on npm
echo "1. Checking if package exists on npm..."
npm view @mikeo-ai/claude-context-local-mcp version 2>/dev/null

if [ $? -eq 0 ]; then
    VERSION=$(npm view @mikeo-ai/claude-context-local-mcp version)
    echo "   ✅ Package found on npm, version: $VERSION"
else
    echo "   ❌ Package not found on npm (not published yet)"
    exit 1
fi

# Test 2: Test with npx
echo ""
echo "2. Testing with npx (should output 'MCP Server running on stdio')..."
echo "   Running: npx @mikeo-ai/claude-context-local-mcp"
echo "   (Press Ctrl+C after seeing the output)"
echo ""

# Run npx command with timeout
timeout 3 npx @mikeo-ai/claude-context-local-mcp 2>&1 | head -1

# Test 3: Generate Claude config
echo ""
echo "3. Generating Claude Code configuration..."
echo ""
echo "Add this to your claude_desktop_config.json:"
echo ""
cat << 'EOF'
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
EOF

echo ""
echo "4. Alternative: Claude MCP add command:"
echo ""
cat << 'EOF'
claude mcp add claude-context-local \
  -e EMBEDDING_PROVIDER=Ollama \
  -e OLLAMA_MODEL=DC1LEX/nomic-embed-text-v1.5-multimodal \
  -e POSTGRES_DATABASE=embeddings \
  -- npx @mikeo-ai/claude-context-local-mcp@latest
EOF

echo ""
echo "==========================================="
echo "✅ Package validation complete!"
echo ""
echo "Next steps:"
echo "1. Update README.md to remove 'Coming Soon' notices"
echo "2. Test with Claude Code"
echo "3. Create GitHub release"
echo "4. Announce to community"