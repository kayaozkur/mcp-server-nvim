import * as fs from 'fs-extra';
import * as path from 'path';

export class KeybindingHandler {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates');
  }

  async getKeybindings(args: any) {
    const { mode = 'all', plugin, format = 'json' } = args;

    try {
      const keybindingsPath = path.join(this.templateDir, 'plugin_keybindings_summary.md');

      if (!await fs.pathExists(keybindingsPath)) {
        throw new Error('Keybindings summary not found');
      }

      const content = await fs.readFile(keybindingsPath, 'utf8');
      const keybindings = this.extractKeybindings(content, mode, plugin);

      switch (format) {
        case 'json':
          return { content: [{ type: 'text', text: JSON.stringify(keybindings, null, 2) }] };
        case 'markdown':
          return { content: [{ type: 'text', text: this.formatAsMarkdown(keybindings) }] };
        case 'table':
          return { content: [{ type: 'text', text: this.formatAsTable(keybindings) }] };
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Failed to get keybindings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateKeybindings(args: any) {
    // WARNING: This method should never be used
    throw new Error(
      '⚠️ KEYBINDING MODIFICATION PROHIBITED!\n\n' +
      'The keybindings in this configuration are carefully preset and optimized.\n' +
      'They should NEVER be changed by Claude or any automated process.\n' +
      'Any modifications will likely break the integration.\n\n' +
      'If you need different keybindings, please create a separate custom configuration.\n' +
      'Refer to plugin_keybindings_summary.md for the current keybinding documentation.'
    );
    
    // Original code kept for reference but should never execute
    const { keybindings, backup = true } = args;
    const keybindingsPath = path.join(this.templateDir, 'lua/mappings.lua');

    try {
      let currentContent = '';

      if (await fs.pathExists(keybindingsPath)) {
        currentContent = await fs.readFile(keybindingsPath, 'utf8');
      }

      if (backup) {
        const backupPath = `${keybindingsPath}.backup.${Date.now()}`;
        await fs.writeFile(backupPath, currentContent);
      }

      // Append new keybindings
      const newContent = this.generateKeybindingsContent(keybindings, currentContent);
      await fs.writeFile(keybindingsPath, newContent);

      return {
        content: [{
          type: 'text',
          text: 'Successfully updated keybindings'
        }]
      };
    } catch (error: any) {
      throw new Error(`Failed to update keybindings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private extractKeybindings(content: string, mode: string, plugin?: string): any[] {
    const lines = content.split('\n');
    const keybindings: any[] = [];
    let currentPlugin: string | null = null;

    for (const line of lines) {
      if (line.startsWith('### ')) {
        currentPlugin = line.substring(4).trim();
        continue;
      }

      if (plugin && currentPlugin !== plugin) {
        continue;
      }

      const match = line.match(/\`(.+?)\`\s*\(([^)]+)\)\s*-\s*(.+)/);

      if (match) {
        const [, keys, modes, description] = match;
        const modeList = modes.split(',').map(m => m.trim().toLowerCase());

        if (mode === 'all' || modeList.includes(mode.toLowerCase())) {
          keybindings.push({
            plugin: currentPlugin,
            keys,
            modes: modeList,
            description: description.trim(),
          });
        }
      }
    }

    return keybindings;
  }

  private formatAsMarkdown(keybindings: any[]): string {
    let markdown = '# Keybindings\n\n';

    keybindings.forEach(kb => {
      markdown += `### ${kb.plugin}\n`;
      markdown += `- **Keys**: ${kb.keys}\n`;
      markdown += `- **Modes**: ${kb.modes.join(', ')}\n`;
      markdown += `- **Description**: ${kb.description}\n\n`;
    });

    return markdown;
  }

  private formatAsTable(keybindings: any[]): string {
    let table = '| Plugin | Keys | Modes | Description |\n';
    table += '|--------|------|-------|-------------|\n';

    keybindings.forEach(kb => {
      table += `| ${kb.plugin} | ${kb.keys} | ${kb.modes.join(', ')} | ${kb.description} |\n`;
    });

    return table;
  }

  private generateKeybindingsContent(newKeybindings: any[], currentContent: string): string {
    const newKeybindingsContent = newKeybindings.map(kb => {
      return `map('${kb.modes.join(', ')}', '${kb.keys}', '${kb.command}', { desc: '${kb.description}' })`;
    }).join('\n');

    return currentContent + '\n' + newKeybindingsContent;
  }
}

