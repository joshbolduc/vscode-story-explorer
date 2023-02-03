import type { Subscription } from 'rxjs';
import { ConfigurationScope, workspace } from 'vscode';
import { configPrefix } from '../constants/constants';
import { logError } from '../log/log';
import type { ValueOrPromise } from './ValueOrPromise';
import { fromVsCodeSetting } from './rxjs/fromVsCodeSetting';

export class SettingsWatcher<T = unknown> {
  private readonly subscription: Subscription;

  public constructor(
    private readonly setting: string,
    callback: (watcher: SettingsWatcher<T>) => ValueOrPromise<void>,
  ) {
    this.subscription = fromVsCodeSetting(setting, {
      readFirst: false,
    }).subscribe(() => {
      callback(this)?.catch((err) => {
        logError(
          'Failed to invoke configuration change callback',
          err,
          setting,
        );
      });
    });
  }

  public read(scope?: ConfigurationScope) {
    return workspace.getConfiguration(configPrefix, scope).get<T>(this.setting);
  }

  public dispose() {
    this.subscription.unsubscribe();
  }
}
