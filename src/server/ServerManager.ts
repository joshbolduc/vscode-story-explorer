import {
  serverExternalUrlConfigSuffix,
  serverInternalBehaviorConfigSuffix,
  serverInternalEnabledConfigSuffix,
} from '../constants/constants';
import { logError } from '../log/log';
import { SettingsWatcher } from '../util/SettingsWatcher';
import { readConfiguration } from '../util/getConfiguration';
import type { ServerMode } from './ServerMode';
import { StorybookServer } from './StorybookServer';
import { processExecutions } from './processExecutions';

export class ServerManager {
  private server?: StorybookServer | undefined;
  private readonly behaviorSettingsWatcher = new SettingsWatcher(
    serverInternalBehaviorConfigSuffix,
    () => {
      Promise.resolve(this.refreshMode()).catch((e) => {
        logError('Failed to set internal server mode', e);
      });
    },
  );

  private readonly enabledSettingsWatcher = new SettingsWatcher(
    serverInternalEnabledConfigSuffix,
    () => {
      Promise.resolve(this.refreshMode()).catch((e) => {
        logError('Failed to set internal server mode', e);
      });
    },
  );

  // Eagerly subscribe since we want to observe process executions as soon as
  // possible, in case they're relevant later
  private readonly processExecutionsSubscription =
    processExecutions.subscribe();

  public static async init() {
    const serverManager = new ServerManager();
    await serverManager.init();

    return serverManager;
  }

  public init() {
    if (this.shouldStartImmediately()) {
      return this.ensureServerHealthy();
    }
  }

  public stop() {
    this.server?.stop();
  }

  public ensureServerHealthy() {
    if (!this.isInternalServerEnabled()) {
      const rawSetting = readConfiguration(serverExternalUrlConfigSuffix);

      if (!rawSetting || typeof rawSetting !== 'string') {
        return 'http://localhost:6006';
      }

      return rawSetting;
    }

    return this.ensureServer().ensureServerHealthy();
  }

  public dispose() {
    this.server?.dispose();
    this.server = undefined;

    this.behaviorSettingsWatcher.dispose();
    this.enabledSettingsWatcher.dispose();
    this.processExecutionsSubscription.unsubscribe();
  }

  public isInternalServerEnabled() {
    return !!this.enabledSettingsWatcher.read();
  }

  private getMode(): ServerMode {
    const rawValue = this.behaviorSettingsWatcher.read();

    switch (rawValue) {
      case 'deferred':
      case 'immediate':
        return rawValue;
    }

    return 'deferred';
  }

  private shouldStartImmediately() {
    return this.isInternalServerEnabled() && this.getMode() === 'immediate';
  }

  private ensureServer() {
    if (!this.server) {
      this.server = new StorybookServer(processExecutions);
    }

    return this.server;
  }

  private refreshMode() {
    if (this.shouldStartImmediately()) {
      return this.init();
    }

    return this.stop();
  }
}
