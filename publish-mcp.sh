#!/bin/bash

# Script to publish the MCP package to npm

echo "🚀 Claude Context Local - NPM Publishing Script"
echo "============================================="
echo ""

# Check if logged in to npm
echo "Checking npm login status..."
if ! npm whoami &> /dev/null; then
    echo "❌ Not logged in to npm"
    echo ""
    echo "Please login first with:"
    echo "  npm login"
    echo ""
    echo "Or create an account with:"
    echo "  npm adduser"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ Logged in as: $NPM_USER"
echo ""

# Navigate to MCP package
cd packages/mcp

# Show what will be published
echo "📦 Package details:"
echo "  Name: @mikeo-ai/claude-context-local-mcp"
echo "  Version: $(node -p "require('./package.json').version")"
echo ""

# Confirm before publishing
read -p "Do you want to publish this package? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled"
    exit 1
fi

# Publish the package
echo ""
echo "Publishing to npm..."
npm publish --access public

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Package published successfully!"
    echo ""
    echo "Users can now install with:"
    echo "  npm install -g @mikeo-ai/claude-context-local-mcp"
    echo ""
    echo "Or use with npx:"
    echo "  npx @mikeo-ai/claude-context-local-mcp"
    echo ""
    echo "Test the Claude MCP command:"
    echo "  claude mcp add claude-context-local \\"
    echo "    -e EMBEDDING_PROVIDER=Ollama \\"
    echo "    -e POSTGRES_DATABASE=embeddings \\"
    echo "    -- npx @mikeo-ai/claude-context-local-mcp"
else
    echo ""
    echo "❌ Publishing failed!"
    echo ""
    echo "Common issues:"
    echo "  - Package name already taken"
    echo "  - Version already exists (bump version with: npm version patch)"
    echo "  - Not authorized for scope @mikeo-ai"
    exit 1
fi