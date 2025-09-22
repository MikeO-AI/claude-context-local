#!/usr/bin/env node

/**
 * MCP Setup Validation Script
 * Validates that all prerequisites are properly configured for claude-context-local
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHECKS = {
  postgresql: false,
  pgvector: false,
  ollama: false,
  ollamaModel: false,
  database: false,
  mcpBuild: false,
  claudeConfig: false
};

const OLLAMA_MODEL = 'DC1LEX/nomic-embed-text-v1.5-multimodal';

console.log('🔍 Claude Context Local - MCP Setup Validator');
console.log('==============================================\n');

async function checkPostgreSQL() {
  try {
    await execAsync('which psql');
    const { stdout } = await execAsync('psql --version');
    console.log('✅ PostgreSQL installed:', stdout.trim());
    CHECKS.postgresql = true;
  } catch {
    console.log('❌ PostgreSQL not found. Install with: brew install postgresql@14');
  }
}

async function checkPgVector() {
  try {
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: 'postgres',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres'
    });

    await client.connect();
    const result = await client.query(
      "SELECT * FROM pg_available_extensions WHERE name = 'vector'"
    );
    await client.end();

    if (result.rows.length > 0) {
      console.log('✅ pgvector extension available');
      CHECKS.pgvector = true;
    } else {
      console.log('❌ pgvector not installed. Install with: brew install pgvector');
    }
  } catch (error) {
    console.log('⚠️  Could not check pgvector:', error.message);
  }
}

async function checkDatabase() {
  try {
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: 'embeddings',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres'
    });

    await client.connect();

    // Check if vector extension is enabled
    const extResult = await client.query(
      "SELECT * FROM pg_extension WHERE extname = 'vector'"
    );

    if (extResult.rows.length > 0) {
      console.log('✅ Database "embeddings" exists with vector extension');
      CHECKS.database = true;
    } else {
      console.log('⚠️  Database exists but vector extension not enabled');
      console.log('   Run: psql -U postgres -d embeddings -c "CREATE EXTENSION IF NOT EXISTS vector;"');
    }

    await client.end();
  } catch (error) {
    if (error.code === '3D000') {
      console.log('❌ Database "embeddings" not found');
      console.log('   Run: psql -U postgres -c "CREATE DATABASE embeddings;"');
    } else {
      console.log('❌ Could not connect to PostgreSQL:', error.message);
    }
  }
}

async function checkOllama() {
  try {
    const response = await fetch('http://localhost:11434/api/version');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama running, version:', data.version);
      CHECKS.ollama = true;

      // Check for model
      const modelsResponse = await fetch('http://localhost:11434/api/tags');
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const hasModel = modelsData.models?.some(m => m.name === OLLAMA_MODEL);

        if (hasModel) {
          console.log(`✅ Ollama model ${OLLAMA_MODEL} installed`);
          CHECKS.ollamaModel = true;
        } else {
          console.log(`❌ Ollama model ${OLLAMA_MODEL} not found`);
          console.log(`   Run: ollama pull ${OLLAMA_MODEL}`);
        }
      }
    }
  } catch {
    console.log('❌ Ollama not running. Start with: ollama serve');
  }
}

async function checkMCPBuild() {
  try {
    const mcpIndexPath = path.join(__dirname, 'packages/mcp/dist/index-postgres.js');
    await fs.access(mcpIndexPath);
    console.log('✅ MCP server built and ready');
    CHECKS.mcpBuild = true;
  } catch {
    console.log('❌ MCP server not built. Run: pnpm build');
  }
}

async function checkClaudeConfig() {
  const configPath = path.join(
    process.env.HOME,
    'Library/Application Support/Claude/claude_desktop_config.json'
  );

  try {
    const config = await fs.readFile(configPath, 'utf-8');
    const parsedConfig = JSON.parse(config);

    if (parsedConfig.mcpServers?.['claude-context-local']) {
      console.log('✅ Claude Code configuration found');
      CHECKS.claudeConfig = true;
    } else {
      console.log('⚠️  claude-context-local not configured in Claude Code');
      console.log('   See README for configuration instructions');
    }
  } catch {
    console.log('⚠️  Claude Code configuration file not found');
    console.log('   This is normal if Claude Code is not installed yet');
  }
}

async function runValidation() {
  await checkPostgreSQL();
  await checkPgVector();
  await checkDatabase();
  await checkOllama();
  await checkMCPBuild();
  await checkClaudeConfig();

  console.log('\n' + '='.repeat(50));

  const allPassed = Object.values(CHECKS).every(v => v);
  const criticalPassed = CHECKS.postgresql && CHECKS.database &&
                         CHECKS.ollama && CHECKS.ollamaModel && CHECKS.mcpBuild;

  if (allPassed) {
    console.log('🎉 All checks passed! Your setup is ready.');
    console.log('\nYou can now use one of these methods to run the MCP:');
    console.log('\n1. Direct method (for testing):');
    console.log('   node packages/mcp/dist/index-postgres.js');
    console.log('\n2. Via Claude Code (recommended):');
    console.log('   Restart Claude Code to load the MCP server');
  } else if (criticalPassed) {
    console.log('✅ Critical components ready! Optional items:');
    if (!CHECKS.pgvector) console.log('  - pgvector extension (performance optimization)');
    if (!CHECKS.claudeConfig) console.log('  - Claude Code configuration');
  } else {
    console.log('❌ Some required components are missing.');
    console.log('Please fix the issues above before proceeding.');
  }

  process.exit(allPassed ? 0 : 1);
}

runValidation().catch(console.error);