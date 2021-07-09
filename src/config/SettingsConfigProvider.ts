import { EventEmitter } from 'vscode';
import { SettingsWatcher } from '../util/SettingsWatcher';
import type { ConfigProvider } from './ConfigProvider';

export class SettingsConfigProvider<T, U> implements ConfigProvider<T> {
  private settingsWatcher?: SettingsWatcher<U>;
  private readonly onDidChangeConfigEmitter = new EventEmitter<
    | {
        value: T;
      }
    | undefined
  >();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeConfig = this.onDidChangeConfigEmitter.event;

  public constructor(
    private readonly settingName: string,
    private readonly transformer: (
      setting: U | undefined,
    ) => { value: T } | undefined,
  ) {}

  public start() {
    if (!this.settingsWatcher) {
      this.settingsWatcher = new SettingsWatcher(
        this.settingName,
        (watcher) => {
          this.onDidChangeConfigEmitter.fire(this.transformer(watcher.read()));
        },
      );
    }

    return this.transformer(this.settingsWatcher.read());
  }

  public stop(): void {
    this.settingsWatcher?.dispose();
    this.settingsWatcher = undefined;
  }

  public dispose(): void {
    this.stop();
  }
}
