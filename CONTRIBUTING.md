# Contributing to claude-context-local

Thank you for your interest in contributing to claude-context-local! This is a community project aimed at providing a fully local alternative to cloud-based code context solutions.

## 🎯 Project Goals

- Maintain 100% local operation with no external dependencies
- Provide easy setup and deployment options
- Support multiple local databases and embedding models
- Ensure privacy and data sovereignty for users
- Keep compatibility with Claude Code MCP protocol

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/MikeO-AI/claude-context-local.git
   cd claude-context-local
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up local environment**
   ```bash
   # Start PostgreSQL
   brew services start postgresql@14

   # Start Ollama
   ollama serve

   # Pull the embedding model
   ollama pull DC1LEX/nomic-embed-text-v1.5-multimodal

   # Create database
   psql -U postgres -c "CREATE DATABASE embeddings;"
   psql -U postgres -d embeddings -c "CREATE EXTENSION vector;"
   ```

4. **Build and test**
   ```bash
   pnpm build
   node test-postgres.js
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing code formatting (2 spaces, no semicolons in TS)
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Commit Messages
Follow conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `chore:` Build process or auxiliary tool changes

Examples:
```
feat: add SQLite support for vector storage
fix: correct dimension mismatch in PostgreSQL queries
docs: update README with Docker instructions
```

### Testing
- Add tests for new features
- Ensure existing tests pass
- Test with different configurations
- Verify MCP integration with Claude Code

## 🎁 Areas for Contribution

### High Priority
- **SQLite Support**: Add SQLite with sqlite-vss for simpler setup
- **DuckDB Integration**: Support for analytical workloads
- **More Embedding Models**: Support for other Ollama models
- **Performance**: Query optimization and caching
- **Docker Improvements**: One-click deployment solution

### Medium Priority
- **Web UI**: Management interface for indexed codebases
- **Incremental Indexing**: Only update changed files
- **Multiple Collections**: Support organizing code into collections
- **Batch Operations**: Optimize bulk indexing
- **Progress Reporting**: Better feedback during indexing

### Low Priority
- **Alternative Embeddings**: Support for local alternatives to Ollama
- **Hybrid Search**: Combine vector and keyword search
- **Export/Import**: Backup and restore functionality
- **Metrics**: Performance monitoring and statistics

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add/update tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   pnpm build
   pnpm test
   node test-postgres.js
   ```

4. **Submit PR**
   - Clear description of changes
   - Link related issues
   - Include test results
   - Add screenshots if UI changes

5. **Review process**
   - Address review comments
   - Keep PR focused and small
   - Be patient and respectful

## 🐛 Reporting Issues

### Bug Reports
Include:
- Environment (OS, Node version, PostgreSQL version)
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs
- Minimal reproduction code

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative approaches considered
- Impact on existing functionality

## 💡 Architecture Decisions

### Why PostgreSQL?
- Mature, reliable, widely deployed
- pgvector provides excellent vector operations
- Easy backup and migration
- Good performance for most use cases

### Why Ollama?
- True local execution
- No API keys required
- Good model selection
- Active development and community

### Future Considerations
- Support for multiple databases simultaneously
- Pluggable embedding providers
- Distributed indexing for large codebases
- Real-time file watching and updates

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing opinions
- Keep discussions professional

## 📄 Legal

- Contributions are licensed under MIT
- Maintain attribution to original claude-context project
- Ensure no proprietary code is included
- Respect third-party licenses

## 🆘 Getting Help

- Open an issue for bugs or features
- Join discussions in GitHub Discussions
- Check existing issues before creating new ones
- Be clear and provide context

## 🙏 Acknowledgments

Special thanks to:
- Original claude-context team at Zilliz
- Contributors to PostgreSQL and pgvector
- Ollama team and community
- All contributors to this project

---

Thank you for helping make claude-context-local better for everyone!
