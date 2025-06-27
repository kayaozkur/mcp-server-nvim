export declare class PluginHandler {
    private templateDir;
    private lazyLockPath;
    constructor();
    listPlugins(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getPluginConfig(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    managePlugin(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private getInstalledPlugins;
    private scanPluginConfigurations;
    private parsePluginConfig;
    private getCategoryFromFile;
    private getPluginMetadata;
    private getPluginConfigDetails;
    private extractPluginSection;
    private extractKeybindingsForPlugin;
    private installPlugin;
    private updatePlugin;
    private removePlugin;
    private syncPlugins;
}
