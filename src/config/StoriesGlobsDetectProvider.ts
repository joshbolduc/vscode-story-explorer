import { Disposable, EventEmitter } from 'vscode';
import { logWarn } from '../log/log';

import { getStoriesGlobs } from '../storybook/getStoriesGlobs';
import { parseConfigFile } from '../storybook/parseConfig';
import { FileWatcher } from '../util/FileWatcher';
import type { Aggregator } from './Aggregator';
import type { ConfigProvider } from './ConfigProvider';
import type { StoriesGlobsConfig } from './StoriesGlobsConfig';
import type { StorybookConfigLocation } from './StorybookConfigLocation';

const getStoriesGlobsFromFileUri = async (
  location: StorybookConfigLocation,
): Promise<StoriesGlobsConfig | undefined> => {
  const fileUri = location.file;

  try {
    const config = parseConfigFile(fileUri.fsPath);
    const storiesGlobs = await getStoriesGlobs(config.stories);

    return {
      storiesGlobs,
      storiesGlobsRoot: location.dir.fsPath,
    };
  } catch (e) {
    logWarn('Failed to read stories globs from config file', e, fileUri);
    return undefined;
  }
};

export class StoriesGlobsDetectProvider
  implements ConfigProvider<StoriesGlobsConfig>
{
  private readonly onDidChangeConfigEmitter = new EventEmitter<
    | {
        value: StoriesGlobsConfig;
      }
    | undefined
  >();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeConfig = this.onDidChangeConfigEmitter.event;

  private configLocationListener?: Disposable;

  private storiesGlobsConfig?: StoriesGlobsConfig;

  private configFileWatcher?: FileWatcher;

  public constructor(
    private readonly configLocationAggregator: Aggregator<StorybookConfigLocation>,
  ) {}

  public async start() {
    const configLocation = await this.configLocationAggregator.init();

    this.configLocationListener =
      this.configLocationAggregator.onDidChangeConfig(this.handleReadAndUpdate);

    await this.readGlobsFromLocation(configLocation);
    return this.storiesGlobsConfig
      ? { value: this.storiesGlobsConfig }
      : undefined;
  }

  public stop(): void {
    this.configLocationListener?.dispose();
    this.configLocationListener = undefined;
  }

  public dispose(): void {
    this.stop();
    this.onDidChangeConfigEmitter.dispose();
    this.configFileWatcher?.dispose();
  }

  private readonly handleReadAndUpdate = async (
    location: StorybookConfigLocation | undefined,
  ) => {
    await this.readGlobsFromLocation(location);
    this.onDidChangeConfigEmitter.fire(
      this.storiesGlobsConfig ? { value: this.storiesGlobsConfig } : undefined,
    );
  };

  private async readGlobsFromLocation(
    location: StorybookConfigLocation | undefined,
  ) {
    this.configFileWatcher?.dispose();
    if (location) {
      this.configFileWatcher = new FileWatcher(
        location.file.fsPath,
        () => {
          this.handleReadAndUpdate(location).catch((e) => {
            logWarn('Failed to read updated config file', e, location);
          });
        },
        true,
        false,
        true,
      );
    }

    this.storiesGlobsConfig = location
      ? await getStoriesGlobsFromFileUri(location)
      : undefined;
  }
}
