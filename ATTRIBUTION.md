# Attribution

## Original Project

This project is based on **[claude-context](https://github.com/zilliztech/claude-context)** by Zilliz.

### Original Copyright
Copyright (c) 2024-2025 Zilliz

### Original License
MIT License

### Original Contributors
- [Zilliz Team](https://github.com/zilliztech)
- [Cheney Zhang](https://github.com/shanghaikid) - Original author

## Modifications

### PostgreSQL + Ollama Implementation
Copyright (c) 2025 MikeO-AI

### Key Changes Made
1. **Database Layer**: Replaced Milvus/Zilliz Cloud with PostgreSQL + pgvector
2. **Embedding Provider**: Replaced OpenAI API with Ollama local embeddings
3. **Architecture**: Converted from cloud-based to 100% local implementation
4. **New Files Added**:
   - `packages/core/src/vectordb/postgres-vectordb.ts` - PostgreSQL vector database implementation
   - `packages/mcp/src/config-postgres.ts` - PostgreSQL-specific configuration
   - `packages/mcp/src/index-postgres.ts` - PostgreSQL MCP server
   - `test-postgres.js` - Integration test script
   - `README-POSTGRES.md` - PostgreSQL setup documentation

### Dependencies Added
- `pg` - PostgreSQL client for Node.js
- `@types/pg` - TypeScript definitions for pg

## License Compliance

Both the original project and this fork are licensed under the MIT License, which permits:
- Commercial and private use
- Distribution
- Modification
- Patent use
- Private use

The MIT License requires:
- License and copyright notice must be included
- The software is provided "as is" without warranty

## Acknowledgments

Special thanks to:
- The Zilliz team for creating the original claude-context project
- The PostgreSQL community for pgvector extension
- The Ollama team for providing local LLM infrastructure
- The open-source community for making local-first AI possible

## Contributing Back

We encourage contributions to both projects:
- Original project: https://github.com/zilliztech/claude-context
- This fork: https://github.com/MikeO-AI/claude-context-local

If you develop features that could benefit the original project, please consider submitting pull requests upstream.