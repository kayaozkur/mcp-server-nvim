#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ConfigHandler } from './handlers/config-handler.js';
import { PluginHandler } from './handlers/plugin-handler.js';
import { OrchestraHandler } from './handlers/orchestra-handler.js';
import { KeybindingHandler } from './handlers/keybinding-handler.js';
import { SessionHandler } from './handlers/session-handler.js';
import { HealthHandler } from './handlers/health-handler.js';
class NvimMCPServer {
    server;
    configHandler;
    pluginHandler;
    orchestraHandler;
    keybindingHandler;
    sessionHandler;
    healthHandler;
    constructor() {
        this.server = new Server({
            name: 'mcp-server-nvim',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
        // Initialize handlers
        this.configHandler = new ConfigHandler();
        this.pluginHandler = new PluginHandler();
        this.orchestraHandler = new OrchestraHandler();
        this.keybindingHandler = new KeybindingHandler();
        this.sessionHandler = new SessionHandler();
        this.healthHandler = new HealthHandler();
        this.setupHandlers();
    }
    setupHandlers() {
        // List all available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = [
                // Health Check
                {
                    name: 'check-health',
                    description: 'Check system health and dependencies for NvChad environment',
                    inputSchema: {
                        type: 'object',
                        properties: {}
                    }
                },
                // Configuration Management
                {
                    name: 'get-nvim-config',
                    description: 'Retrieve current Neovim configuration files and settings',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            configType: {
                                type: 'string',
                                enum: ['init', 'plugins', 'mappings', 'options', 'all'],
                                description: 'Type of configuration to retrieve'
                            },
                            filePath: {
                                type: 'string',
                                description: 'Specific file path (optional)'
                            }
                        }
                    }
                },
                {
                    name: 'set-nvim-config',
                    description: 'Update Neovim configuration files',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            configType: {
                                type: 'string',
                                enum: ['init', 'plugins', 'mappings', 'options'],
                                description: 'Type of configuration to update'
                            },
                            content: {
                                type: 'string',
                                description: 'New configuration content'
                            },
                            filePath: {
                                type: 'string',
                                description: 'Specific file path to update'
                            },
                            backup: {
                                type: 'boolean',
                                default: true,
                                description: 'Create backup before updating'
                            }
                        },
                        required: ['configType', 'content']
                    }
                },
                {
                    name: 'generate-config-template',
                    description: 'Generate configuration templates for new setups',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            templateType: {
                                type: 'string',
                                enum: ['minimal', 'full', 'custom'],
                                description: 'Type of template to generate'
                            },
                            targetPath: {
                                type: 'string',
                                description: 'Target directory for the configuration'
                            },
                            features: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of features to include'
                            }
                        },
                        required: ['templateType', 'targetPath']
                    }
                },
                // Plugin Management
                {
                    name: 'list-plugins',
                    description: 'List all installed Neovim plugins with their status',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filter: {
                                type: 'string',
                                description: 'Filter plugins by name or category'
                            },
                            includeConfig: {
                                type: 'boolean',
                                default: false,
                                description: 'Include plugin configuration details'
                            }
                        }
                    }
                },
                {
                    name: 'get-plugin-config',
                    description: 'Get configuration for a specific plugin',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            pluginName: {
                                type: 'string',
                                description: 'Name of the plugin'
                            }
                        },
                        required: ['pluginName']
                    }
                },
                {
                    name: 'manage-plugin',
                    description: 'Install, update, or remove plugins',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            action: {
                                type: 'string',
                                enum: ['install', 'update', 'remove', 'sync'],
                                description: 'Action to perform'
                            },
                            pluginName: {
                                type: 'string',
                                description: 'Name or URL of the plugin'
                            },
                            config: {
                                type: 'string',
                                description: 'Plugin configuration (for install)'
                            }
                        },
                        required: ['action']
                    }
                },
                // Orchestra Functions
                {
                    name: 'run-orchestra-script',
                    description: 'Execute nvim-orchestra scripts for multi-instance coordination',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            scriptName: {
                                type: 'string',
                                enum: ['ultimate-orchestra', 'orchestrator', 'claude-controller', 'vim-swarm'],
                                description: 'Name of the orchestra script to run'
                            },
                            args: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Arguments to pass to the script'
                            },
                            async: {
                                type: 'boolean',
                                default: false,
                                description: 'Run script asynchronously'
                            }
                        },
                        required: ['scriptName']
                    }
                },
                {
                    name: 'broadcast-message',
                    description: 'Broadcast messages to all Neovim instances via orchestra',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                                description: 'Message to broadcast'
                            },
                            targets: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Specific instances to target (optional)'
                            },
                            messageType: {
                                type: 'string',
                                enum: ['info', 'warning', 'error', 'command'],
                                default: 'info',
                                description: 'Type of message'
                            }
                        },
                        required: ['message']
                    }
                },
                {
                    name: 'sync-nvim-instances',
                    description: 'Synchronize configurations and states between Neovim instances',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            syncType: {
                                type: 'string',
                                enum: ['config', 'session', 'buffers', 'all'],
                                description: 'Type of synchronization'
                            },
                            sourceInstance: {
                                type: 'string',
                                description: 'Source instance ID (optional)'
                            },
                            targetInstances: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Target instance IDs (optional)'
                            }
                        },
                        required: ['syncType']
                    }
                },
                // Keybinding Management
                {
                    name: 'get-keybindings',
                    description: 'Retrieve keybinding documentation and current mappings',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            mode: {
                                type: 'string',
                                enum: ['normal', 'insert', 'visual', 'command', 'all'],
                                default: 'all',
                                description: 'Vim mode for keybindings'
                            },
                            plugin: {
                                type: 'string',
                                description: 'Filter by specific plugin'
                            },
                            format: {
                                type: 'string',
                                enum: ['json', 'markdown', 'table'],
                                default: 'json',
                                description: 'Output format'
                            }
                        }
                    }
                },
                {
                    name: 'update-keybindings',
                    description: '⚠️ DEPRECATED - DO NOT USE! Keybindings are preset and should never be modified',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            keybindings: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        mode: { type: 'string' },
                                        key: { type: 'string' },
                                        command: { type: 'string' },
                                        description: { type: 'string' },
                                        opts: { type: 'object' }
                                    }
                                },
                                description: 'Array of keybinding configurations'
                            },
                            backup: {
                                type: 'boolean',
                                default: true,
                                description: 'Create backup before updating'
                            }
                        },
                        required: ['keybindings']
                    }
                },
                // Session Management
                {
                    name: 'manage-session',
                    description: 'Create, restore, or manage Neovim sessions',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            action: {
                                type: 'string',
                                enum: ['create', 'restore', 'list', 'delete'],
                                description: 'Session action to perform'
                            },
                            sessionName: {
                                type: 'string',
                                description: 'Name of the session'
                            },
                            autoSave: {
                                type: 'boolean',
                                default: true,
                                description: 'Enable auto-save for session'
                            }
                        },
                        required: ['action']
                    }
                },
                // Bootstrap & Templates
                {
                    name: 'bootstrap-nvchad',
                    description: 'Bootstrap a new NvChad installation with templates',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            targetPath: {
                                type: 'string',
                                description: 'Target installation directory'
                            },
                            includeOrchestra: {
                                type: 'boolean',
                                default: true,
                                description: 'Include orchestra scripts'
                            },
                            templateType: {
                                type: 'string',
                                enum: ['minimal', 'full', 'development'],
                                default: 'full',
                                description: 'Bootstrap template type'
                            }
                        },
                        required: ['targetPath']
                    }
                },
                {
                    name: 'export-config',
                    description: 'Export current configuration as a reusable template',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            outputPath: {
                                type: 'string',
                                description: 'Export destination path'
                            },
                            includePlugins: {
                                type: 'boolean',
                                default: true,
                                description: 'Include plugin configurations'
                            },
                            includeScripts: {
                                type: 'boolean',
                                default: true,
                                description: 'Include orchestra scripts'
                            }
                        },
                        required: ['outputPath']
                    }
                }
            ];
            return { tools };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    // Health Check
                    case 'check-health':
                        return await this.healthHandler.checkHealth(args);
                    // Configuration Management
                    case 'get-nvim-config':
                        return await this.configHandler.getConfig(args);
                    case 'set-nvim-config':
                        return await this.configHandler.setConfig(args);
                    case 'generate-config-template':
                        return await this.configHandler.generateTemplate(args);
                    // Plugin Management
                    case 'list-plugins':
                        return await this.pluginHandler.listPlugins(args);
                    case 'get-plugin-config':
                        return await this.pluginHandler.getPluginConfig(args);
                    case 'manage-plugin':
                        return await this.pluginHandler.managePlugin(args);
                    // Orchestra Functions
                    case 'run-orchestra-script':
                        return await this.orchestraHandler.runScript(args);
                    case 'broadcast-message':
                        return await this.orchestraHandler.broadcastMessage(args);
                    case 'sync-nvim-instances':
                        return await this.orchestraHandler.syncInstances(args);
                    // Keybinding Management
                    case 'get-keybindings':
                        return await this.keybindingHandler.getKeybindings(args);
                    case 'update-keybindings':
                        return await this.keybindingHandler.updateKeybindings(args);
                    // Session Management
                    case 'manage-session':
                        return await this.sessionHandler.manageSession(args);
                    // Bootstrap & Templates
                    case 'bootstrap-nvchad':
                        return await this.configHandler.bootstrapNvChad(args);
                    case 'export-config':
                        return await this.configHandler.exportConfig(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        // Server started
    }
}
// Start the server
const server = new NvimMCPServer();
server.run().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
