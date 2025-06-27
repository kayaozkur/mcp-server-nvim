export declare class SessionHandler {
    private sessionDir;
    private templateDir;
    constructor();
    manageSession(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private createSession;
    private restoreSession;
    private listSessions;
    private deleteSession;
    private getSessions;
    private generateSessionScript;
    exportSession(sessionName: string, outputPath: string): Promise<string>;
    importSession(sessionPath: string, newName?: string): Promise<string>;
    cloneSession(sourceName: string, targetName: string): Promise<string>;
}
