import type { Subscription } from 'rxjs';
import type { ConfigurationScope } from 'vscode';
import { logError } from '../log/log';
import type { ConfigurationSuffix } from '../types/ConfigurationSuffix';
import type { ValueOrPromise } from './ValueOrPromise';
import { getConfiguration } from './getConfiguration';
import { fromVsCodeSetting } from './rxjs/fromVsCodeSetting';

export class SettingsWatcher<T = unknown> {
  private readonly subscription: Subscription;

  public constructor(
    private readonly setting: ConfigurationSuffix,
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
    return getConfiguration(scope).get<T>(this.setting);
  }

  public dispose() {
    this.subscription.unsubscribe();
  }
}
