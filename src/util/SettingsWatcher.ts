import { ConfigurationScope, Disposable, workspace } from 'vscode';
import { configPrefix } from '../constants/constants';
import { logError } from '../log/log';
import { makeFullConfigName } from './makeFullConfigName';

export class SettingsWatcher<T = unknown> {
  private readonly disposable: Disposable;

  public constructor(
    private readonly setting: string,
    callback: (watcher: SettingsWatcher<T>) => void | Promise<void>,
  ) {
    this.disposable = workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(makeFullConfigName(setting))) {
        callback(this)?.catch((err) => {
          logError(
            'Failed to invoke configuration change callback',
            err,
            setting,
          );
        });
      }
    });
  }

  public read(scope?: ConfigurationScope) {
    return workspace.getConfiguration(configPrefix, scope).get<T>(this.setting);
  }

  public dispose() {
    this.disposable.dispose();
  }
}
