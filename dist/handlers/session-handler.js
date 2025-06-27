import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class SessionHandler {
    sessionDir;
    templateDir;
    constructor() {
        this.templateDir = path.join(__dirname, '../templates');
        this.sessionDir = path.join(this.templateDir, 'sessions');
    }
    async manageSession(args) {
        const { action, sessionName, autoSave = true } = args;
        try {
            await fs.ensureDir(this.sessionDir);
            let result;
            switch (action) {
                case 'create':
                    result = await this.createSession(sessionName, autoSave);
                    break;
                case 'restore':
                    result = await this.restoreSession(sessionName);
                    break;
                case 'list':
                    result = await this.listSessions();
                    break;
                case 'delete':
                    result = await this.deleteSession(sessionName);
                    break;
                default:
                    throw new Error(`Unknown session action: ${action}`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            action,
                            sessionName,
                            result,
                            timestamp: new Date().toISOString()
                        }, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            throw new Error(`Failed to ${action} session: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async createSession(sessionName, autoSave = true) {
        if (!sessionName) {
            sessionName = `session_${Date.now()}`;
        }
        const sessionFile = path.join(this.sessionDir, `${sessionName}.vim`);
        // Create session configuration
        const sessionConfig = {
            name: sessionName,
            created: new Date().toISOString(),
            autoSave,
            buffers: [],
            windows: [],
            tabs: [],
            workingDirectory: process.cwd(),
            settings: {
                autoSave,
                autoRestore: true
            }
        };
        // Generate Vim session script
        const sessionScript = this.generateSessionScript(sessionConfig);
        await fs.writeFile(sessionFile, sessionScript);
        // Create session metadata
        const metadataFile = path.join(this.sessionDir, `${sessionName}.json`);
        await fs.writeFile(metadataFile, JSON.stringify(sessionConfig, null, 2));
        return `Session '${sessionName}' created successfully at ${sessionFile}`;
    }
    async restoreSession(sessionName) {
        if (!sessionName) {
            // Find the most recent session
            const sessions = await this.getSessions();
            if (sessions.length === 0) {
                throw new Error('No sessions found');
            }
            sessionName = sessions.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())[0].name;
        }
        const sessionFile = path.join(this.sessionDir, `${sessionName}.vim`);
        if (!await fs.pathExists(sessionFile)) {
            throw new Error(`Session '${sessionName}' not found`);
        }
        // In a real implementation, this would use nvim remote API
        // For now, we'll provide the command to restore the session
        return `To restore session '${sessionName}', run: nvim -S "${sessionFile}"`;
    }
    async listSessions() {
        const sessions = await this.getSessions();
        if (sessions.length === 0) {
            return 'No sessions found';
        }
        const sessionList = sessions.map(session => ({
            name: session.name,
            created: session.created,
            autoSave: session.autoSave,
            lastModified: session.lastModified || session.created
        }));
        return JSON.stringify({
            total: sessions.length,
            sessions: sessionList
        }, null, 2);
    }
    async deleteSession(sessionName) {
        if (!sessionName) {
            throw new Error('Session name is required for deletion');
        }
        const sessionFile = path.join(this.sessionDir, `${sessionName}.vim`);
        const metadataFile = path.join(this.sessionDir, `${sessionName}.json`);
        let deleted = 0;
        if (await fs.pathExists(sessionFile)) {
            await fs.remove(sessionFile);
            deleted++;
        }
        if (await fs.pathExists(metadataFile)) {
            await fs.remove(metadataFile);
            deleted++;
        }
        if (deleted === 0) {
            throw new Error(`Session '${sessionName}' not found`);
        }
        return `Session '${sessionName}' deleted successfully`;
    }
    async getSessions() {
        if (!await fs.pathExists(this.sessionDir)) {
            return [];
        }
        const files = await fs.readdir(this.sessionDir);
        const sessions = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const sessionPath = path.join(this.sessionDir, file);
                    const session = await fs.readJson(sessionPath);
                    // Add file modification time
                    const stats = await fs.stat(sessionPath);
                    session.lastModified = stats.mtime.toISOString();
                    sessions.push(session);
                }
                catch (error) {
                    console.warn(`Failed to read session metadata: ${file}`, error);
                }
            }
        }
        return sessions;
    }
    generateSessionScript(config) {
        return `" Neovim Session: ${config.name}
" Created: ${config.created}
" Auto-generated by MCP Server for Neovim

" Change to working directory
cd ${config.workingDirectory}

" Set session options
set sessionoptions=blank,buffers,curdir,folds,help,tabpages,winsize,winpos

" Auto-save settings
${config.autoSave ? 'autocmd VimLeave * mksession! ' + path.join(this.sessionDir, `${config.name}.vim`) : ''}

" Restore window layout
" (This would be populated with actual window/buffer information in a real implementation)

" Session-specific settings
let g:session_name = '${config.name}'
let g:session_autosave = ${config.autoSave ? 'v:true' : 'v:false'}

echo "Session '${config.name}' loaded"
`;
    }
    // Additional session management methods
    async exportSession(sessionName, outputPath) {
        const sessionFile = path.join(this.sessionDir, `${sessionName}.vim`);
        const metadataFile = path.join(this.sessionDir, `${sessionName}.json`);
        if (!await fs.pathExists(sessionFile)) {
            throw new Error(`Session '${sessionName}' not found`);
        }
        await fs.ensureDir(outputPath);
        // Copy session files
        await fs.copy(sessionFile, path.join(outputPath, `${sessionName}.vim`));
        if (await fs.pathExists(metadataFile)) {
            await fs.copy(metadataFile, path.join(outputPath, `${sessionName}.json`));
        }
        return `Session '${sessionName}' exported to ${outputPath}`;
    }
    async importSession(sessionPath, newName) {
        if (!await fs.pathExists(sessionPath)) {
            throw new Error(`Session file not found: ${sessionPath}`);
        }
        const originalName = path.basename(sessionPath, '.vim');
        const sessionName = newName || originalName;
        const targetFile = path.join(this.sessionDir, `${sessionName}.vim`);
        const targetMetadata = path.join(this.sessionDir, `${sessionName}.json`);
        // Copy session file
        await fs.copy(sessionPath, targetFile);
        // Create or update metadata
        let metadata = {
            name: sessionName,
            created: new Date().toISOString(),
            imported: true,
            originalPath: sessionPath
        };
        const metadataPath = sessionPath.replace('.vim', '.json');
        if (await fs.pathExists(metadataPath)) {
            try {
                const originalMetadata = await fs.readJson(metadataPath);
                metadata = { ...originalMetadata, ...metadata };
            }
            catch (error) {
                console.warn('Failed to read original metadata:', error);
            }
        }
        await fs.writeFile(targetMetadata, JSON.stringify(metadata, null, 2));
        return `Session imported as '${sessionName}'`;
    }
    async cloneSession(sourceName, targetName) {
        const sourceFile = path.join(this.sessionDir, `${sourceName}.vim`);
        const sourceMetadata = path.join(this.sessionDir, `${sourceName}.json`);
        if (!await fs.pathExists(sourceFile)) {
            throw new Error(`Source session '${sourceName}' not found`);
        }
        const targetFile = path.join(this.sessionDir, `${targetName}.vim`);
        const targetMetadata = path.join(this.sessionDir, `${targetName}.json`);
        // Copy session file
        await fs.copy(sourceFile, targetFile);
        // Update metadata for clone
        let metadata = {
            name: targetName,
            created: new Date().toISOString(),
            clonedFrom: sourceName
        };
        if (await fs.pathExists(sourceMetadata)) {
            try {
                const originalMetadata = await fs.readJson(sourceMetadata);
                metadata = { ...originalMetadata, ...metadata };
            }
            catch (error) {
                console.warn('Failed to read source metadata:', error);
            }
        }
        await fs.writeFile(targetMetadata, JSON.stringify(metadata, null, 2));
        return `Session '${sourceName}' cloned as '${targetName}'`;
    }
}
