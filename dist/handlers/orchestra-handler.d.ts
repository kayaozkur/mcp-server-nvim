export declare class OrchestraHandler {
    private scriptsDir;
    private orchestraDir;
    private templateDir;
    constructor();
    runScript(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    broadcastMessage(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    syncInstances(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getOrchestraStatus(): Promise<any>;
    manageOrchestraSession(action: string, sessionName?: string): Promise<{
        action: string;
        sessionName: string | undefined;
        result: string;
        error: string | null;
    }>;
    private getScriptPath;
    private runScriptSync;
    private runScriptAsync;
    private logOrchestraMessage;
    private updateOrchestraState;
    getActiveInstances(): Promise<any>;
    executeClaudeIntegration(command: string, context?: any): Promise<{
        command: string;
        result: string;
        error: string | null;
    }>;
    manageConcurrentEditing(action: string, data?: any): Promise<{
        action: string;
        result: string;
        error: string | null;
    }>;
}
