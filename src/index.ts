class ServerlessEsLogsPlugin {
  private provider: string;
  private hooks: { [name: string]: () => void };
  private serverless: any;

  constructor(serverless: any) {
    this.provider = 'aws';
    this.serverless = serverless;
    this.hooks = {
      'after:package:initialize': this.afterPackageInitialize.bind(this),
    };
  }

  private afterPackageInitialize(): void {
    this.serverless.cli.log('Initializing ServerlessEsLogsPlugin!');
  }
}

export = ServerlessEsLogsPlugin;
