import { EventEmitter, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import { logError, logInfo, logWarn } from '../log/log';
import { FileWatcher } from '../util/FileWatcher';
import { RecursiveDeleteWatcher } from '../util/RecursiveDeleteWatcher';
import type { ConfigProvider } from './ConfigProvider';
import type { StorybookConfigLocation } from './StorybookConfigLocation';
import { configFileExtensions } from './configFileExtensions';
import { configLocationCompareFn } from './configLocationCompareFn';

const configFileGlob = `**/.storybook/main.{${configFileExtensions.join(',')}}`;

export class StorybookConfigLocationDetectProvider
  implements ConfigProvider<StorybookConfigLocation>
{
  private readonly onDidChangeConfigEmitter = new EventEmitter<
    | {
        value: StorybookConfigLocation;
      }
    | undefined
  >();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeConfig = this.onDidChangeConfigEmitter.event;

  private fileWatcher?: FileWatcher;
  private deleteWatcher?: RecursiveDeleteWatcher;
  private configLocation?: StorybookConfigLocation;

  public async start() {
    if (!this.fileWatcher) {
      this.fileWatcher = new FileWatcher(
        configFileGlob,
        () => {
          this.scanAndSetConfigLocation(true).catch((e) => {
            logWarn('Failed to scan for Storybook config location', e);
          });
        },
        false,
        true,
        true,
      );
    }

    await this.scanAndSetConfigLocation(false);
    return this.configLocation ? { value: this.configLocation } : undefined;
  }

  public stop() {
    this.deleteWatcher?.dispose();
    this.deleteWatcher = undefined;

    this.fileWatcher?.dispose();
    this.fileWatcher = undefined;
  }

  public dispose() {
    this.stop();
    this.onDidChangeConfigEmitter.dispose();
  }

  private async scanAndSetConfigLocation(fireEvent: boolean) {
    const configLocation = await this.scanForConfigLocation();
    this.configLocation = configLocation;

    if (fireEvent) {
      this.onDidChangeConfigEmitter.fire(
        configLocation ? { value: configLocation } : undefined,
      );
    }
  }

  private async scanForConfigLocation() {
    const findResults =
      (await this.fileWatcher?.find('**/node_modules/**')) ?? [];
    const configLocations = findResults.map((uri) => ({
      file: uri,
      dir: Utils.dirname(uri),
      relativePath: workspace.asRelativePath(uri, false),
    }));

    configLocations.sort(configLocationCompareFn);

    let configLocation: StorybookConfigLocation | undefined;

    for (const { dir, file } of configLocations) {
      try {
        await workspace.fs.stat(file);

        configLocation = { dir, file };
        break;
      } catch (e) {
        logInfo('Failed to stat candidate config file', e, file);
      }
    }

    const locationChanged =
      configLocation?.file?.toString() !==
      this.configLocation?.file?.toString();

    if (!locationChanged) {
      return configLocation;
    }

    this.deleteWatcher?.dispose();

    if (!configLocation?.file) {
      return undefined;
    }

    this.deleteWatcher = new RecursiveDeleteWatcher(configLocation.file, () => {
      this.scanAndSetConfigLocation(true).catch((e) => {
        logError(
          'Failed to scan for Storybook config location from delete watcher',
          e,
        );
      });
    });

    logInfo('Determined new config location', configLocation.file);
    return configLocation;
  }
}
