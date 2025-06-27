import which from 'which';
import { execa } from 'execa';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
export class HealthHandler {
    async checkHealth(args) {
        const results = [];
        // Check required dependencies
        results.push(await this.checkRequiredDependencies());
        // Check NvChad configuration
        results.push(await this.checkNvChadConfiguration());
        // Check plugin installations
        results.push(await this.checkPluginInstallations());
        // Check keybinding integrity
        results.push(await this.checkKeybindingIntegrity());
        return {
            content: [
                {
                    type: 'text',
                    text: this.formatHealthReport(results),
                },
            ],
        };
    }
    async checkRequiredDependencies() {
        const required = ['nvim', 'node', 'npm', 'git'];
        const items = [];
        for (const cmd of required) {
            try {
                const cmdPath = await which(cmd);
                let version = 'unknown';
                try {
                    if (cmd === 'nvim') {
                        const { stdout } = await execa('nvim', ['--version']);
                        version = stdout.split('\n')[0].replace('NVIM ', '');
                    }
                    else if (cmd === 'node') {
                        const { stdout } = await execa('node', ['--version']);
                        version = stdout.trim();
                    }
                    else if (cmd === 'npm') {
                        const { stdout } = await execa('npm', ['--version']);
                        version = stdout.trim();
                    }
                    else if (cmd === 'git') {
                        const { stdout } = await execa('git', ['--version']);
                        version = stdout.trim().replace('git version ', '');
                    }
                }
                catch {
                    // Version check failed
                }
                items.push({
                    name: cmd,
                    status: 'ok',
                    message: `Found at ${cmdPath}`,
                    version,
                });
            }
            catch {
                items.push({
                    name: cmd,
                    status: 'error',
                    message: 'Not found in PATH',
                });
            }
        }
        return {
            category: 'Required Dependencies',
            items,
        };
    }
    async checkNvChadConfiguration() {
        const items = [];
        const nvimConfigPath = path.join(os.homedir(), '.config', 'nvim');
        try {
            const stats = await fs.stat(nvimConfigPath);
            if (stats.isDirectory()) {
                // Check for essential NvChad files
                const essentialFiles = [
                    'init.lua',
                    'lua/chadrc.lua',
                    'lua/mappings.lua',
                    'lua/options.lua',
                    'lua/plugins/init.lua'
                ];
                let allFilesFound = true;
                for (const file of essentialFiles) {
                    try {
                        await fs.stat(path.join(nvimConfigPath, file));
                    }
                    catch {
                        allFilesFound = false;
                        items.push({
                            name: `NvChad file: ${file}`,
                            status: 'error',
                            message: 'Missing essential file',
                        });
                    }
                }
                if (allFilesFound) {
                    items.push({
                        name: 'NvChad configuration',
                        status: 'ok',
                        message: 'All essential files present',
                    });
                }
            }
        }
        catch {
            items.push({
                name: 'Neovim config directory',
                status: 'error',
                message: `Not found at ${nvimConfigPath}`,
            });
        }
        return {
            category: 'NvChad Configuration',
            items,
        };
    }
    async checkPluginInstallations() {
        const items = [];
        const nvimDataPath = path.join(os.homedir(), '.local', 'share', 'nvim');
        try {
            // Check if lazy.nvim is installed
            const lazyPath = path.join(nvimDataPath, 'lazy', 'lazy.nvim');
            await fs.stat(lazyPath);
            items.push({
                name: 'lazy.nvim (Plugin Manager)',
                status: 'ok',
                message: 'Installed',
            });
            // Check for some key plugins
            const keyPlugins = [
                'nvim-treesitter',
                'telescope.nvim',
                'nvim-cmp',
                'toggleterm.nvim'
            ];
            for (const plugin of keyPlugins) {
                const pluginPath = path.join(nvimDataPath, 'lazy', plugin);
                try {
                    await fs.stat(pluginPath);
                    items.push({
                        name: plugin,
                        status: 'ok',
                        message: 'Installed',
                    });
                }
                catch {
                    items.push({
                        name: plugin,
                        status: 'warning',
                        message: 'Not installed - run :Lazy sync in Neovim',
                    });
                }
            }
        }
        catch {
            items.push({
                name: 'lazy.nvim',
                status: 'error',
                message: 'Not installed - NvChad setup may be incomplete',
            });
        }
        return {
            category: 'Plugin Installations',
            items,
        };
    }
    async checkKeybindingIntegrity() {
        const items = [];
        const nvimConfigPath = path.join(os.homedir(), '.config', 'nvim');
        try {
            // Check if mappings.lua exists and hasn't been modified
            const mappingsPath = path.join(nvimConfigPath, 'lua', 'mappings.lua');
            await fs.stat(mappingsPath);
            items.push({
                name: 'Keybinding configuration',
                status: 'ok',
                message: 'Mappings file present - DO NOT MODIFY',
            });
            // Check for keybinding documentation
            const keybindingSummaryPath = path.join(nvimConfigPath, 'plugin_keybindings_summary.md');
            try {
                await fs.stat(keybindingSummaryPath);
                items.push({
                    name: 'Keybinding documentation',
                    status: 'ok',
                    message: 'Documentation found',
                });
            }
            catch {
                items.push({
                    name: 'Keybinding documentation',
                    status: 'warning',
                    message: 'Documentation missing - check templates',
                });
            }
        }
        catch {
            items.push({
                name: 'Keybinding configuration',
                status: 'error',
                message: 'Mappings file missing',
            });
        }
        items.push({
            name: 'Keybinding policy',
            status: 'warning',
            message: '⚠️ NEVER modify keybindings - they are preset and locked',
        });
        return {
            category: 'Keybinding Integrity',
            items,
        };
    }
    formatHealthReport(results) {
        let report = '# MCP Neovim Server - Health Check Report\n\n';
        for (const category of results) {
            report += `## ${category.category}\n\n`;
            for (const item of category.items) {
                const icon = item.status === 'ok' ? '✅' :
                    item.status === 'warning' ? '⚠️' : '❌';
                report += `${icon} **${item.name}**\n`;
                report += `   ${item.message}`;
                if (item.version) {
                    report += ` (version: ${item.version})`;
                }
                report += '\n\n';
            }
        }
        // Add recommendations
        report += '## Recommendations\n\n';
        const hasErrors = results.some(r => r.items.some(i => i.status === 'error'));
        if (hasErrors) {
            report += '❌ **Critical issues found!**\n';
            report += '- Install missing dependencies\n';
            report += '- Ensure NvChad is properly configured\n';
            report += '- Run `:Lazy sync` in Neovim to install plugins\n\n';
        }
        const hasWarnings = results.some(r => r.items.some(i => i.status === 'warning'));
        if (hasWarnings) {
            report += '⚠️ **Warnings detected**\n';
            report += '- Some plugins may need installation\n';
            report += '- Remember: NEVER modify keybindings\n\n';
        }
        if (!hasErrors && !hasWarnings) {
            report += '✅ **All systems operational!**\n';
            report += '- Your NvChad environment is fully configured\n';
            report += '- Keybindings are locked and ready\n';
        }
        return report;
    }
}
