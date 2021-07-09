import type { Disposable } from 'vscode';
import { storybookConfigDetectedContext } from '../constants/constants';
import type { FileWatcher } from '../util/FileWatcher';
import { setContext } from '../util/setContext';
import { Aggregator } from './Aggregator';
import { StoriesGlobsDetectProvider } from './StoriesGlobsDetectProvider';
import { StorybookConfigLocationDetectProvider as StorybookConfigLocationDetectProvider } from './StorybookConfigLocationDetector';
import { storiesGlobsConfigProvider } from './storiesGlobsConfigProvider';
import { storybookConfigLocationConfigProvider as storybookConfigLocationConfigProvider } from './storybookConfigLocationConfigProvider';

export class ConfigManager {
  private configLocationListener?: Disposable;

  private readonly storybookConfigLocationAggregator = new Aggregator([
    storybookConfigLocationConfigProvider,
    new StorybookConfigLocationDetectProvider(),
  ]);

  private readonly storiesGlobsConfigAggregator = new Aggregator([
    storiesGlobsConfigProvider,
    new StoriesGlobsDetectProvider(this.storybookConfigLocationAggregator),
  ]);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeStoriesGlobsConfig =
    this.storiesGlobsConfigAggregator.onDidChangeConfig;

  private readonly configFileWatcher?: FileWatcher;

  public static async init() {
    const configManager = new ConfigManager();
    await configManager.init();

    return configManager;
  }

  public getStoriesGlobsConfig() {
    return (
      this.storiesGlobsConfigAggregator.getValue() ?? {
        storiesGlobs: [],
        storiesGlobsRoot: '',
      }
    );
  }

  public dispose() {
    this.storiesGlobsConfigAggregator.dispose();
    this.storybookConfigLocationAggregator.dispose();
    this.configLocationListener?.dispose();
    this.configFileWatcher?.dispose();
  }

  public getConfigDir() {
    return this.storybookConfigLocationAggregator.getValue()?.dir;
  }

  public getConfigFile() {
    return this.storybookConfigLocationAggregator.getValue()?.file;
  }

  private async init() {
    this.configLocationListener =
      this.storybookConfigLocationAggregator.onDidChangeConfig((e) => {
        setContext(storybookConfigDetectedContext, e !== undefined);
      });

    // Order/serialization here is important, since stories globs config depends
    // on config location
    await this.storybookConfigLocationAggregator.init();
    await this.storiesGlobsConfigAggregator.init();
  }
}
