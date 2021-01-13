declare class ServerlessEsLogsPlugin {
    hooks: {
        [name: string]: () => void;
    };
    private provider;
    private serverless;
    private options;
    private logProcesserDir;
    private logProcesserName;
    private logProcesserLogicalId;
    private defaultLambdaFilterPattern;
    private defaultApiGWFilterPattern;
    private defaultIndexDateSeparator;
    constructor(serverless: any, options: {
        [name: string]: any;
    });
    private custom;
    private afterPackageCreateDeploymentArtifacts;
    private afterPackageInitialize;
    private mergeCustomProviderResources;
    private formatCommandLineOpts;
    private validatePluginOptions;
    private addApiGwCloudwatchSubscription;
    private addLambdaCloudwatchSubscriptions;
    private configureLogRetention;
    private addLogProcesser;
    private patchLogProcesserRole;
    private cleanupFiles;
}
export = ServerlessEsLogsPlugin;
