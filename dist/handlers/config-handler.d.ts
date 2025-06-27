export declare class ConfigHandler {
    private templateDir;
    constructor();
    getConfig(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    setConfig(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    generateTemplate(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    bootstrapNvChad(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    exportConfig(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private getConfigByType;
    private getDefaultConfigPath;
    private applyFeatureCustomizations;
}
