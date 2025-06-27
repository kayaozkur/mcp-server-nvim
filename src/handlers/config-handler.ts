import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class ConfigHandler {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates');
  }

  async getConfig(args: any) {
    const { configType = 'all', filePath } = args;

    try {
      if (filePath) {
        // Get specific file
        const content = await fs.readFile(filePath, 'utf8');
        return {
          content: [
            {
              type: 'text',
              text: `File: ${filePath}\n\n${content}`
            }
          ]
        };
      }

      // Get configuration by type
      const configs = await this.getConfigByType(configType);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(configs, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setConfig(args: any) {
    const { configType, content, filePath, backup = true } = args;

    try {
      const targetPath = filePath || await this.getDefaultConfigPath(configType);
      
      if (backup && await fs.pathExists(targetPath)) {
        const backupPath = `${targetPath}.backup.${Date.now()}`;
        await fs.copy(targetPath, backupPath);
      }

      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content, 'utf8');

      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated ${configType} configuration at ${targetPath}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to set config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateTemplate(args: any) {
    const { templateType, targetPath, features = [] } = args;

    try {
      await fs.ensureDir(targetPath);

      // Copy base template
      const sourceTemplate = path.join(this.templateDir, templateType === 'minimal' ? 'minimal' : '.');
      
      if (templateType === 'full') {
        // Copy full configuration
        await fs.copy(this.templateDir, targetPath, {
          filter: (src, dest) => {
            // Exclude certain files for template generation
            const relativePath = path.relative(this.templateDir, src);
            return !relativePath.includes('node_modules') && 
                   !relativePath.includes('.git') &&
                   !relativePath.includes('lazy-lock.json');
          }
        });
      } else if (templateType === 'minimal') {
        // Copy only essential files
        const essentialFiles = [
          'init.lua',
          'lua/mappings.lua',
          'lua/options.lua',
          'lua/plugins/init.lua'
        ];

        for (const file of essentialFiles) {
          const sourcePath = path.join(this.templateDir, file);
          const destPath = path.join(targetPath, file);
          
          if (await fs.pathExists(sourcePath)) {
            await fs.ensureDir(path.dirname(destPath));
            await fs.copy(sourcePath, destPath);
          }
        }
      }

      // Apply feature customizations
      if (features.length > 0) {
        await this.applyFeatureCustomizations(targetPath, features);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully generated ${templateType} template at ${targetPath} with features: ${features.join(', ')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to generate template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async bootstrapNvChad(args: any) {
    const { targetPath, includeOrchestra = true, templateType = 'full' } = args;

    try {
      // Create target directory
      await fs.ensureDir(targetPath);

      // Copy NvChad configuration
      await this.generateTemplate({
        templateType,
        targetPath,
        features: includeOrchestra ? ['orchestra'] : []
      });

      // Set up additional orchestra files if requested
      if (includeOrchestra) {
        const orchestraDir = path.join(targetPath, 'orchestra');
        const scriptsDir = path.join(targetPath, 'scripts');
        
        await fs.ensureDir(orchestraDir);
        await fs.ensureDir(scriptsDir);

        // Copy orchestra scripts
        const sourceScriptsDir = path.join(this.templateDir, 'scripts');
        if (await fs.pathExists(sourceScriptsDir)) {
          await fs.copy(sourceScriptsDir, scriptsDir);
        }

        // Copy orchestra state files
        const sourceOrchestraDir = path.join(this.templateDir, 'orchestra');
        if (await fs.pathExists(sourceOrchestraDir)) {
          await fs.copy(sourceOrchestraDir, orchestraDir);
        }
      }

      // Create setup script
      const setupScript = `#!/bin/bash
# NvChad Setup Script
echo "Setting up NvChad with Lepion configuration..."

# Make scripts executable
chmod +x ${path.join(targetPath, 'scripts')}/*.sh
chmod +x ${path.join(targetPath, 'scripts')}/*.py

echo "NvChad setup complete!"
echo "Configuration location: ${targetPath}"
${includeOrchestra ? 'echo "Orchestra scripts are available in the scripts directory"' : ''}
`;

      await fs.writeFile(path.join(targetPath, 'setup.sh'), setupScript);
      await fs.chmod(path.join(targetPath, 'setup.sh'), '755');

      return {
        content: [
          {
            type: 'text',
            text: `Successfully bootstrapped NvChad at ${targetPath}\nTemplate type: ${templateType}\nOrchestra included: ${includeOrchestra}\nRun ./setup.sh to complete the setup.`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to bootstrap NvChad: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async exportConfig(args: any) {
    const { outputPath, includePlugins = true, includeScripts = true } = args;

    try {
      await fs.ensureDir(outputPath);

      // Export core configuration
      const configFiles = await glob('**/*.lua', { cwd: this.templateDir });
      
      for (const file of configFiles) {
        const sourcePath = path.join(this.templateDir, file);
        const destPath = path.join(outputPath, file);
        
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(sourcePath, destPath);
      }

      // Export plugin configurations
      if (includePlugins) {
        const pluginFiles = ['lazy-lock.json', 'plugin_keybindings_summary.md'];
        for (const file of pluginFiles) {
          const sourcePath = path.join(this.templateDir, file);
          const destPath = path.join(outputPath, file);
          
          if (await fs.pathExists(sourcePath)) {
            await fs.copy(sourcePath, destPath);
          }
        }
      }

      // Export scripts
      if (includeScripts) {
        const scriptsDir = path.join(this.templateDir, 'scripts');
        if (await fs.pathExists(scriptsDir)) {
          await fs.copy(scriptsDir, path.join(outputPath, 'scripts'));
        }

        const orchestraDir = path.join(this.templateDir, 'orchestra');
        if (await fs.pathExists(orchestraDir)) {
          await fs.copy(orchestraDir, path.join(outputPath, 'orchestra'));
        }
      }

      // Create export manifest
      const manifest = {
        exportDate: new Date().toISOString(),
        includePlugins,
        includeScripts,
        configFiles: configFiles.length,
        description: 'Exported Neovim NvChad configuration with Lepion customizations'
      };

      await fs.writeFile(
        path.join(outputPath, 'export-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      return {
        content: [
          {
            type: 'text',
            text: `Successfully exported configuration to ${outputPath}\nFiles exported: ${configFiles.length}\nPlugins included: ${includePlugins}\nScripts included: ${includeScripts}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to export config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getConfigByType(configType: string) {
    const configs: any = {};

    try {
      switch (configType) {
        case 'init':
          configs.init = await fs.readFile(path.join(this.templateDir, 'init.lua'), 'utf8');
          break;
        case 'plugins':
          const pluginFiles = await glob('lua/plugins/**/*.lua', { cwd: this.templateDir });
          for (const file of pluginFiles) {
            configs[file] = await fs.readFile(path.join(this.templateDir, file), 'utf8');
          }
          break;
        case 'mappings':
          configs.mappings = await fs.readFile(path.join(this.templateDir, 'lua/mappings.lua'), 'utf8');
          break;
        case 'options':
          const optionsPath = path.join(this.templateDir, 'lua/options.lua');
          if (await fs.pathExists(optionsPath)) {
            configs.options = await fs.readFile(optionsPath, 'utf8');
          }
          break;
        case 'all':
        default:
          const allFiles = await glob('**/*.lua', { cwd: this.templateDir });
          for (const file of allFiles) {
            configs[file] = await fs.readFile(path.join(this.templateDir, file), 'utf8');
          }
          break;
      }
    } catch (error) {
      throw new Error(`Failed to read config files: ${error instanceof Error ? error.message : String(error)}`);
    }

    return configs;
  }

  private async getDefaultConfigPath(configType: string): Promise<string> {
    const nvimConfigDir = process.env.XDG_CONFIG_HOME 
      ? path.join(process.env.XDG_CONFIG_HOME, 'nvim')
      : path.join(process.env.HOME || '', '.config', 'nvim');

    switch (configType) {
      case 'init':
        return path.join(nvimConfigDir, 'init.lua');
      case 'mappings':
        return path.join(nvimConfigDir, 'lua', 'mappings.lua');
      case 'options':
        return path.join(nvimConfigDir, 'lua', 'options.lua');
      case 'plugins':
        return path.join(nvimConfigDir, 'lua', 'plugins', 'init.lua');
      default:
        throw new Error(`Unknown config type: ${configType}`);
    }
  }

  private async applyFeatureCustomizations(targetPath: string, features: string[]) {
    // Apply feature-specific customizations
    for (const feature of features) {
      switch (feature) {
        case 'orchestra':
          // Ensure orchestra integration is enabled
          const initPath = path.join(targetPath, 'init.lua');
          if (await fs.pathExists(initPath)) {
            let initContent = await fs.readFile(initPath, 'utf8');
            if (!initContent.includes('claude-integration')) {
              initContent += '\n-- Orchestra integration\nrequire("claude-integration")\n';
              await fs.writeFile(initPath, initContent);
            }
          }
          break;
        // Add more feature customizations as needed
      }
    }
  }
}
