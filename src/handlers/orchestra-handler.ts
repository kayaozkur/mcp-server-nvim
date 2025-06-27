import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class OrchestraHandler {
  private scriptsDir: string;
  private orchestraDir: string;
  private templateDir: string;

  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.templateDir = path.join(__dirname, '../templates');
    this.scriptsDir = path.join(__dirname, '../scripts');
    this.orchestraDir = path.join(this.templateDir, 'orchestra');
  }

  async runScript(args: any) {
    const { scriptName, args: scriptArgs = [], async = false } = args;

    try {
      const scriptPath = await this.getScriptPath(scriptName);
      
      if (!await fs.pathExists(scriptPath)) {
        throw new Error(`Script not found: ${scriptName}`);
      }

      const result = async ? 
        await this.runScriptAsync(scriptPath, scriptArgs) :
        await this.runScriptSync(scriptPath, scriptArgs);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              script: scriptName,
              async,
              result,
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to run script: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async broadcastMessage(args: any) {
    const { message, targets = [], messageType = 'info' } = args;

    try {
      // Use the broadcast script from your orchestra setup
      const broadcastScript = path.join(this.scriptsDir, 'ultimate-orchestra.sh');
      
      if (!await fs.pathExists(broadcastScript)) {
        throw new Error('Orchestra broadcast script not found');
      }

      // Log the message to orchestra messages
      await this.logOrchestraMessage(message, messageType, targets);

      // Execute broadcast using your existing script
      const broadcastArgs = ['broadcast', message];
      if (targets.length > 0) {
        broadcastArgs.push('--targets', targets.join(','));
      }

      const { stdout, stderr } = await execAsync(`bash "${broadcastScript}" ${broadcastArgs.join(' ')}`);

      // Update orchestra state
      await this.updateOrchestraState('broadcast', {
        message,
        messageType,
        targets,
        timestamp: new Date().toISOString()
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              action: 'broadcast',
              message,
              messageType,
              targets: targets.length > 0 ? targets : 'all',
              result: stdout || 'Message broadcasted successfully',
              error: stderr || null
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to broadcast message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async syncInstances(args: any) {
    const { syncType, sourceInstance, targetInstances = [] } = args;

    try {
      // Use the orchestrator script for synchronization
      const orchestratorScript = path.join(this.scriptsDir, 'nvim_orchestrator.py');
      
      if (!await fs.pathExists(orchestratorScript)) {
        throw new Error('Orchestra orchestrator script not found');
      }

      const syncArgs = ['sync', '--type', syncType];
      
      if (sourceInstance) {
        syncArgs.push('--source', sourceInstance);
      }
      
      if (targetInstances.length > 0) {
        syncArgs.push('--targets', targetInstances.join(','));
      }

      const { stdout, stderr } = await execAsync(`python3 "${orchestratorScript}" ${syncArgs.join(' ')}`);

      // Update orchestra state
      await this.updateOrchestraState('sync', {
        syncType,
        sourceInstance,
        targetInstances,
        timestamp: new Date().toISOString()
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              action: 'sync',
              syncType,
              sourceInstance,
              targetInstances,
              result: stdout || 'Synchronization completed',
              error: stderr || null
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to sync instances: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getOrchestraStatus() {
    try {
      const stateFile = path.join(this.orchestraDir, 'state.json');
      const messagesFile = path.join(this.orchestraDir, 'messages.log');

      const status: any = {
        timestamp: new Date().toISOString(),
        state: {},
        recentMessages: [],
        availableScripts: []
      };

      // Read orchestra state
      if (await fs.pathExists(stateFile)) {
        status.state = await fs.readJson(stateFile);
      }

      // Read recent messages
      if (await fs.pathExists(messagesFile)) {
        const messages = await fs.readFile(messagesFile, 'utf8');
        status.recentMessages = messages.split('\n')
          .filter(line => line.trim())
          .slice(-10) // Last 10 messages
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return { message: line, timestamp: 'unknown' };
            }
          });
      }

      // List available scripts
      if (await fs.pathExists(this.scriptsDir)) {
        const files = await fs.readdir(this.scriptsDir);
        status.availableScripts = files.filter(file => 
          file.endsWith('.sh') || file.endsWith('.py')
        );
      }

      return status;
    } catch (error) {
      throw new Error(`Failed to get orchestra status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async manageOrchestraSession(action: string, sessionName?: string) {
    try {
      const sessionScript = path.join(this.scriptsDir, 'ultimate-orchestra.sh');
      
      if (!await fs.pathExists(sessionScript)) {
        throw new Error('Orchestra session script not found');
      }

      const sessionArgs = [action];
      if (sessionName) {
        sessionArgs.push(sessionName);
      }

      const { stdout, stderr } = await execAsync(`bash "${sessionScript}" ${sessionArgs.join(' ')}`);

      return {
        action,
        sessionName,
        result: stdout || `Session ${action} completed`,
        error: stderr || null
      };
    } catch (error) {
      throw new Error(`Failed to manage orchestra session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getScriptPath(scriptName: string): Promise<string> {
    const scriptMappings: { [key: string]: string } = {
      'ultimate-orchestra': 'ultimate-orchestra.sh',
      'orchestrator': 'nvim_orchestrator.py',
      'claude-controller': 'claude_ai_controller.py',
      'vim-swarm': 'vim_swarm.py'
    };

    const fileName = scriptMappings[scriptName] || scriptName;
    return path.join(this.scriptsDir, fileName);
  }

  private async runScriptSync(scriptPath: string, args: string[]): Promise<string> {
    try {
      const extension = path.extname(scriptPath);
      let command: string;

      if (extension === '.py') {
        command = `python3 "${scriptPath}" ${args.join(' ')}`;
      } else if (extension === '.sh') {
        command = `bash "${scriptPath}" ${args.join(' ')}`;
      } else {
        command = `"${scriptPath}" ${args.join(' ')}`;
      }

      const { stdout, stderr } = await execAsync(command);
      return stdout || stderr || 'Script executed successfully';
    } catch (error) {
      throw new Error(`Script execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async runScriptAsync(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const extension = path.extname(scriptPath);
      let command: string;
      let cmdArgs: string[];

      if (extension === '.py') {
        command = 'python3';
        cmdArgs = [scriptPath, ...args];
      } else if (extension === '.sh') {
        command = 'bash';
        cmdArgs = [scriptPath, ...args];
      } else {
        command = scriptPath;
        cmdArgs = args;
      }

      const child = spawn(command, cmdArgs, {
        detached: true,
        stdio: 'ignore'
      });

      child.unref();

      // Give it a moment to start
      setTimeout(() => {
        resolve(`Script ${path.basename(scriptPath)} started asynchronously with PID: ${child.pid}`);
      }, 1000);

      child.on('error', (error) => {
        reject(new Error(`Failed to start script: ${error.message}`));
      });
    });
  }

  private async logOrchestraMessage(message: string, type: string, targets: string[]) {
    try {
      const messagesFile = path.join(this.orchestraDir, 'messages.log');
      await fs.ensureFile(messagesFile);

      const logEntry = {
        timestamp: new Date().toISOString(),
        type,
        message,
        targets: targets.length > 0 ? targets : ['all']
      };

      await fs.appendFile(messagesFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to log orchestra message:', error);
    }
  }

  private async updateOrchestraState(action: string, data: any) {
    try {
      const stateFile = path.join(this.orchestraDir, 'state.json');
      await fs.ensureFile(stateFile);

      let state: any = {};
      if (await fs.pathExists(stateFile)) {
        try {
          state = await fs.readJson(stateFile);
        } catch {
          state = {};
        }
      }

      // Update state with new action
      if (!state.history) {
        state.history = [];
      }

      state.lastAction = {
        action,
        data,
        timestamp: new Date().toISOString()
      };

      state.history.push(state.lastAction);

      // Keep only last 50 history entries
      if (state.history.length > 50) {
        state.history = state.history.slice(-50);
      }

      await fs.writeJson(stateFile, state, { spaces: 2 });
    } catch (error) {
      console.error('Failed to update orchestra state:', error);
    }
  }

  // Additional utility methods for advanced orchestra features
  async getActiveInstances() {
    try {
      // This would typically query active nvim instances
      // For now, we'll simulate by checking state
      const status = await this.getOrchestraStatus();
      return status.state.activeInstances || [];
    } catch (error) {
      return [];
    }
  }

  async executeClaudeIntegration(command: string, context?: any) {
    try {
      const claudeScript = path.join(this.scriptsDir, 'claude_ai_controller.py');
      
      if (!await fs.pathExists(claudeScript)) {
        throw new Error('Claude integration script not found');
      }

      const args = [command];
      if (context) {
        args.push('--context', JSON.stringify(context));
      }

      const { stdout, stderr } = await execAsync(`python3 "${claudeScript}" ${args.join(' ')}`);

      return {
        command,
        result: stdout || 'Claude integration executed',
        error: stderr || null
      };
    } catch (error) {
      throw new Error(`Claude integration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async manageConcurrentEditing(action: string, data?: any) {
    try {
      const vimSwarmScript = path.join(this.scriptsDir, 'vim_swarm.py');
      
      if (!await fs.pathExists(vimSwarmScript)) {
        throw new Error('Vim Swarm script not found');
      }

      const args = [action];
      if (data) {
        args.push('--data', JSON.stringify(data));
      }

      const { stdout, stderr } = await execAsync(`python3 "${vimSwarmScript}" ${args.join(' ')}`);

      return {
        action,
        result: stdout || 'Swarm action completed',
        error: stderr || null
      };
    } catch (error) {
      throw new Error(`Swarm management failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
