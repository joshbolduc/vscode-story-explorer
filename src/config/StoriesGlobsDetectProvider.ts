import { Disposable, EventEmitter, Uri } from 'vscode';
import {
  storybookConfigParsedContext,
  storybookConfigParseFailedContext,
} from '../constants/constants';
import { logWarn } from '../log/log';

import { getStoriesGlobs } from '../storybook/getStoriesGlobs';
import { parseLocalConfigFile } from '../storybook/parseLocalConfigFile';
import { FileWatcher } from '../util/FileWatcher';
import { getRelativePatternForWorkspace } from '../util/getRelativePatternForWorkspace';
import { isVirtualUri } from '../util/isVirtualUri';
import { setContext } from '../util/setContext';
import type { Aggregator } from './Aggregator';
import type { ConfigProvider } from './ConfigProvider';
import type { GlobSpecifier } from './GlobSpecifier';
import type { StorybookConfigLocation } from './StorybookConfigLocation';
import { configFileExtensions } from './configFileExtensions';
import { findConfigFileInDir } from './findConfigFileInDir';
import { interpretStoriesConfigItem } from './normalizeStoriesEntry';

const setParseFailedConfigContext = (failed: boolean) => {
  setContext(storybookConfigParseFailedContext, failed);
};
const setParsedConfigContext = (parsed: boolean) => {
  setContext(storybookConfigParsedContext, parsed);
};

const resetConfigContext = () => {
  setParsedConfigContext(false);
  setParseFailedConfigContext(false);
};

const parseConfigUri = (uri: Uri) => {
  if (!isVirtualUri(uri)) {
    return parseLocalConfigFile(uri.fsPath);
  }

  return undefined;
};

const getStoriesGlobsFromLocation = async (
  location: StorybookConfigLocation,
): Promise<GlobSpecifier[] | undefined> => {
  const fileUri = await findConfigFileInDir(location.dir);
  if (!fileUri) {
    return undefined;
  }

  const config = parseConfigUri(fileUri);
  const parsed = !!config;
  setParsedConfigContext(parsed);
  setParseFailedConfigContext(!parsed);

  if (!parsed) {
    return undefined;
  }

  try {
    const storiesConfigItems = await getStoriesGlobs(config.stories);
    const configDir = location.dir;

    return Promise.all(
      storiesConfigItems.map((configItem) =>
        interpretStoriesConfigItem(configItem, configDir),
      ),
    );
  } catch (e) {
    logWarn('Failed to read stories globs from config file', e, fileUri);
    return undefined;
  }
};

export class StoriesGlobsDetectProvider
  implements ConfigProvider<GlobSpecifier[]>
{
  private readonly onDidChangeConfigEmitter = new EventEmitter<
    | {
        value: GlobSpecifier[];
      }
    | undefined
  >();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeConfig = this.onDidChangeConfigEmitter.event;

  private configLocationListener?: Disposable | undefined;

  private storiesGlobsConfig?: GlobSpecifier[] | undefined;

  private configFileWatcher?: FileWatcher | undefined;

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

    resetConfigContext();
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
    resetConfigContext();

    this.configFileWatcher?.dispose();
    if (location) {
      this.configFileWatcher = new FileWatcher(
        getRelativePatternForWorkspace(
          location.dir,
          `main.{${configFileExtensions.join(',')}}`,
        ),

        () => {
          this.handleReadAndUpdate(location).catch((e) => {
            logWarn('Failed to read updated config file', e, location);
          });
        },
        false,
        false,
        false,
      );
    }

    this.storiesGlobsConfig = location
      ? await getStoriesGlobsFromLocation(location)
      : undefined;
  }
}
