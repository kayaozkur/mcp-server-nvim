import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PluginHandler {
  private templateDir: string;
  private lazyLockPath: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates');
    this.lazyLockPath = path.join(this.templateDir, 'lazy-lock.json');
  }

  async listPlugins(args: any) {
    const { filter, includeConfig = false } = args;

    try {
      const plugins = await this.getInstalledPlugins();
      let filteredPlugins = plugins;

      if (filter) {
        filteredPlugins = plugins.filter(plugin => 
          plugin.name.toLowerCase().includes(filter.toLowerCase()) ||
          (plugin.category && plugin.category.toLowerCase().includes(filter.toLowerCase()))
        );
      }

      if (includeConfig) {
        // Enhance plugins with configuration details
        for (const plugin of filteredPlugins) {
          plugin.config = await this.getPluginConfigDetails(plugin.name);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total: filteredPlugins.length,
              plugins: filteredPlugins
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to list plugins: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPluginConfig(args: any) {
    const { pluginName } = args;

    try {
      const config = await this.getPluginConfigDetails(pluginName);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(config, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get plugin config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async managePlugin(args: any) {
    const { action, pluginName, config } = args;

    try {
      let result: string;

      switch (action) {
        case 'install':
          result = await this.installPlugin(pluginName, config);
          break;
        case 'update':
          result = await this.updatePlugin(pluginName);
          break;
        case 'remove':
          result = await this.removePlugin(pluginName);
          break;
        case 'sync':
          result = await this.syncPlugins();
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to ${action} plugin: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getInstalledPlugins() {
    const plugins: any[] = [];

    try {
      // Read lazy-lock.json for installed plugins
      if (await fs.pathExists(this.lazyLockPath)) {
        const lazyLock = await fs.readJson(this.lazyLockPath);
        
        for (const [name, info] of Object.entries(lazyLock)) {
          plugins.push({
            name,
            version: (info as any).branch || (info as any).commit || 'latest',
            source: 'lazy.nvim',
            status: 'installed',
            ...this.getPluginMetadata(name)
          });
        }
      }

      // Read plugin configurations from lua files
      const pluginConfigs = await this.scanPluginConfigurations();
      
      // Merge with configuration info
      for (const plugin of plugins) {
        const configInfo = pluginConfigs.find(p => p.name === plugin.name);
        if (configInfo) {
          plugin.configFile = configInfo.file;
          plugin.hasKeybindings = configInfo.hasKeybindings;
          plugin.category = configInfo.category;
        }
      }

      return plugins;
    } catch (error) {
      throw new Error(`Failed to get installed plugins: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async scanPluginConfigurations() {
    const configs: any[] = [];
    
    try {
      const pluginFiles = [
        'lua/plugins/init.lua',
        'lua/plugins/editor.lua',
        'lua/plugins/ui.lua',
        'lua/plugins/lsp.lua',
        // Add more plugin config files as needed
      ];

      for (const file of pluginFiles) {
        const filePath = path.join(this.templateDir, file);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const pluginInfo = this.parsePluginConfig(content, file);
          configs.push(...pluginInfo);
        }
      }

      return configs;
    } catch (error) {
      throw new Error(`Failed to scan plugin configurations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private parsePluginConfig(content: string, file: string) {
    const plugins: any[] = [];
    
    // Simple regex-based parsing for plugin names
    // This could be enhanced with a proper Lua parser
    const pluginRegex = /["']([^"']+\/[^"']+)["']/g;
    let match;
    
    while ((match = pluginRegex.exec(content)) !== null) {
      const fullName = match[1];
      const name = fullName.split('/')[1];
      
      plugins.push({
        name,
        fullName,
        file,
        hasKeybindings: content.includes('keys') || content.includes('keybind'),
        category: this.getCategoryFromFile(file)
      });
    }

    return plugins;
  }

  private getCategoryFromFile(file: string): string {
    if (file.includes('editor')) return 'editor';
    if (file.includes('ui')) return 'ui';
    if (file.includes('lsp')) return 'language-server';
    if (file.includes('dap')) return 'debugging';
    return 'general';
  }

  private getPluginMetadata(name: string) {
    // Plugin categories and descriptions
    const metadata: { [key: string]: any } = {
      'nvim-treesitter': { category: 'syntax', description: 'Syntax highlighting and parsing' },
      'telescope.nvim': { category: 'finder', description: 'Fuzzy finder and picker' },
      'nvim-lspconfig': { category: 'lsp', description: 'Language server configurations' },
      'which-key.nvim': { category: 'ui', description: 'Keybinding guide' },
      'nvim-tree.lua': { category: 'explorer', description: 'File explorer' },
      'bufferline.nvim': { category: 'ui', description: 'Buffer tabs' },
      'lualine.nvim': { category: 'ui', description: 'Status line' },
      'toggleterm.nvim': { category: 'terminal', description: 'Terminal management' },
      'nvim-dap': { category: 'debugging', description: 'Debug adapter protocol' },
      'copilot.vim': { category: 'ai', description: 'GitHub Copilot integration' },
      // Add more plugin metadata as needed
    };

    return metadata[name] || { category: 'general', description: 'Neovim plugin' };
  }

  private async getPluginConfigDetails(pluginName: string) {
    try {
      const config: any = {
        name: pluginName,
        found: false
      };

      // Search for plugin configuration in lua files
      const configFiles = await this.scanPluginConfigurations();
      const pluginConfig = configFiles.find(p => p.name === pluginName);

      if (pluginConfig) {
        config.found = true;
        config.configFile = pluginConfig.file;
        config.category = pluginConfig.category;
        config.hasKeybindings = pluginConfig.hasKeybindings;

        // Read the actual configuration
        const filePath = path.join(this.templateDir, pluginConfig.file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract plugin-specific configuration
        const pluginSection = this.extractPluginSection(content, pluginName);
        if (pluginSection) {
          config.configuration = pluginSection;
        }
      }

      // Check keybindings summary
      const keybindingsPath = path.join(this.templateDir, 'plugin_keybindings_summary.md');
      if (await fs.pathExists(keybindingsPath)) {
        const keybindingsContent = await fs.readFile(keybindingsPath, 'utf8');
        config.keybindings = this.extractKeybindingsForPlugin(keybindingsContent, pluginName);
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to get plugin config details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private extractPluginSection(content: string, pluginName: string): string | null {
    // Simple extraction - could be enhanced with proper Lua parsing
    const lines = content.split('\n');
    let inPluginSection = false;
    let braceCount = 0;
    const pluginLines: string[] = [];

    for (const line of lines) {
      if (line.includes(pluginName)) {
        inPluginSection = true;
      }

      if (inPluginSection) {
        pluginLines.push(line);
        
        // Count braces to determine end of plugin configuration
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        if (braceCount === 0 && pluginLines.length > 1) {
          break;
        }
      }
    }

    return pluginLines.length > 0 ? pluginLines.join('\n') : null;
  }

  private extractKeybindingsForPlugin(content: string, pluginName: string): any[] {
    const keybindings: any[] = [];
    const lines = content.split('\n');
    let inPluginSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.toLowerCase().includes(pluginName.toLowerCase())) {
        inPluginSection = true;
        continue;
      }

      if (inPluginSection) {
        // Stop when we reach the next plugin section
        if (line.startsWith('### ') && !line.toLowerCase().includes(pluginName.toLowerCase())) {
          break;
        }

        // Extract keybinding information
        const keybindMatch = line.match(/`([^`]+)`.*?-\s*(.+)/);
        if (keybindMatch) {
          keybindings.push({
            key: keybindMatch[1],
            description: keybindMatch[2].trim()
          });
        }
      }
    }

    return keybindings;
  }

  private async installPlugin(pluginName: string, config?: string): Promise<string> {
    // This would typically interact with the plugin manager (lazy.nvim)
    // For now, we'll simulate the installation process
    
    if (!config) {
      config = `{
  "${pluginName}",
  lazy = false,
}`;
    }

    // Add to plugin configuration
    const pluginConfigPath = path.join(this.templateDir, 'lua/plugins/user.lua');
    await fs.ensureFile(pluginConfigPath);
    
    let existingConfig = '';
    if (await fs.pathExists(pluginConfigPath)) {
      existingConfig = await fs.readFile(pluginConfigPath, 'utf8');
    }

    if (!existingConfig.includes(pluginName)) {
      const newConfig = existingConfig ? 
        existingConfig.replace(/return\s*{/, `return {\n  ${config},`) :
        `return {\n  ${config},\n}`;
      
      await fs.writeFile(pluginConfigPath, newConfig);
    }

    return `Plugin ${pluginName} configuration added. Run :Lazy sync in Neovim to install.`;
  }

  private async updatePlugin(pluginName?: string): Promise<string> {
    if (pluginName) {
      return `Plugin ${pluginName} marked for update. Run :Lazy update ${pluginName} in Neovim.`;
    } else {
      return 'All plugins marked for update. Run :Lazy update in Neovim.';
    }
  }

  private async removePlugin(pluginName: string): Promise<string> {
    // Remove from plugin configuration files
    const configFiles = [
      'lua/plugins/init.lua',
      'lua/plugins/user.lua',
      'lua/plugins/editor.lua',
      'lua/plugins/ui.lua',
      'lua/plugins/lsp.lua'
    ];

    let removed = false;

    for (const file of configFiles) {
      const filePath = path.join(this.templateDir, file);
      if (await fs.pathExists(filePath)) {
        let content = await fs.readFile(filePath, 'utf8');
        const originalContent = content;

        // Remove plugin entry (simple approach)
        const lines = content.split('\n');
        const filteredLines = lines.filter(line => !line.includes(pluginName));
        
        if (filteredLines.length !== lines.length) {
          content = filteredLines.join('\n');
          await fs.writeFile(filePath, content);
          removed = true;
        }
      }
    }

    return removed ? 
      `Plugin ${pluginName} removed from configuration. Run :Lazy clean in Neovim to uninstall.` :
      `Plugin ${pluginName} not found in configuration files.`;
  }

  private async syncPlugins(): Promise<string> {
    return 'Plugin sync initiated. Run :Lazy sync in Neovim to apply changes.';
  }
}
