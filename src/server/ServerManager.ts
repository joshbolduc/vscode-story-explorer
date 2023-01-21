import { workspace } from 'vscode';
import type { ConfigManager } from '../config/ConfigManager';
import {
  configPrefix,
  serverExternalUrlConfigSuffix,
  serverInternalBehaviorConfigSuffix,
  serverInternalEnabledConfigSuffix,
} from '../constants/constants';
import { logError } from '../log/log';
import { SettingsWatcher } from '../util/SettingsWatcher';
import type { ServerMode } from './ServerMode';
import { StorybookServer } from './StorybookServer';

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

  public constructor(private readonly configManager: ConfigManager) {}

  public static async init(configManager: ConfigManager) {
    const serverManager = new ServerManager(configManager);
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
      const rawSetting = workspace
        .getConfiguration(configPrefix)
        .get<string>(serverExternalUrlConfigSuffix);

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
      this.server = new StorybookServer(this.configManager);
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
