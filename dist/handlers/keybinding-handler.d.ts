export declare class KeybindingHandler {
    private templateDir;
    constructor();
    getKeybindings(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    updateKeybindings(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private extractKeybindings;
    private formatAsMarkdown;
    private formatAsTable;
    private generateKeybindingsContent;
}
