import { Disposable, workspace } from 'vscode';
import { configPrefix } from '../constants/constants';
import { makeFullConfigName } from './makeFullConfigName';

export class SettingsWatcher<T = unknown> {
  private readonly disposable: Disposable;

  public constructor(
    private readonly setting: string,
    callback: (watcher: SettingsWatcher<T>) => void,
  ) {
    this.disposable = workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(makeFullConfigName(setting))) {
        callback(this);
      }
    });
  }

  public read() {
    return workspace.getConfiguration(configPrefix).get<T>(this.setting);
  }

  public dispose() {
    this.disposable.dispose();
  }
}
