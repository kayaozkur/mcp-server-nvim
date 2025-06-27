export declare class HealthHandler {
    checkHealth(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private checkRequiredDependencies;
    private checkNvChadConfiguration;
    private checkPluginInstallations;
    private checkKeybindingIntegrity;
    private formatHealthReport;
}
