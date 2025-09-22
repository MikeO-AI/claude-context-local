#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { Context } from "@zilliz/claude-context-core";
import { PostgresVectorDatabase } from "@zilliz/claude-context-core";

import { createMcpConfig, logConfigurationSummary, ContextMcpConfig } from "./config-postgres.js";
import { createEmbeddingInstance, logEmbeddingProviderInfo } from "./embedding.js";
import { SnapshotManager } from "./snapshot.js";
import { SyncManager } from "./sync.js";
import { ToolHandlers } from "./handlers.js";

class ContextMcpServer {
    private server: Server;
    private context: Context;
    private snapshotManager: SnapshotManager;
    private syncManager: SyncManager;
    private toolHandlers: ToolHandlers;

    constructor(config: ContextMcpConfig) {
        this.server = new Server(
            {
                name: config.name,
                version: config.version
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        // Initialize embedding provider
        console.log(`[EMBEDDING] Initializing embedding provider: ${config.embeddingProvider}`);
        console.log(`[EMBEDDING] Using model: ${config.embeddingModel}`);

        const embedding = createEmbeddingInstance(config);
        logEmbeddingProviderInfo(config, embedding);

        // Initialize PostgreSQL vector database
        const vectorDatabase = new PostgresVectorDatabase({
            host: config.postgresHost,
            port: config.postgresPort,
            database: config.postgresDatabase,
            user: config.postgresUser,
            password: config.postgresPassword
        });

        // Initialize context with PostgreSQL
        this.context = new Context({
            embedding,
            vectorDatabase
        });

        // Initialize managers
        this.snapshotManager = new SnapshotManager();
        this.syncManager = new SyncManager(this.context, this.snapshotManager);
        this.toolHandlers = new ToolHandlers(this.context, this.snapshotManager);

        this.setupHandlers();
    }

    private setupHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "add_codebase",
                    description: "Add a codebase to the context for analysis",
                    inputSchema: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                description: "Path to the codebase directory"
                            }
                        },
                        required: ["path"]
                    }
                },
                {
                    name: "search_codebase", 
                    description: "Search through indexed codebases",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "Search query"
                            },
                            limit: {
                                type: "number",
                                description: "Maximum number of results"
                            }
                        },
                        required: ["query"]
                    }
                }
            ]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case "add_codebase":
                    return await this.toolHandlers.handleIndexCodebase({ ...args, force: false });
                case "search_codebase":
                    return await this.toolHandlers.handleSearchCode({ ...args, path: args?.path || '.' });
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.log(`[MCP] PostgreSQL Context MCP Server running`);
    }
}

async function main(): Promise<void> {
    const config = createMcpConfig();
    logConfigurationSummary(config);
    
    const server = new ContextMcpServer(config);
    await server.run();
}

main().catch(console.error);
