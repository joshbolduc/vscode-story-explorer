import {
  serverExternalUrlConfigSuffix,
  serverInternalBehaviorConfigSuffix,
  serverInternalEnabledConfigSuffix,
  serverInternalPreferExternalConfigSuffix,
} from '../constants/constants';
import { logDebug, logError } from '../log/log';
import { SettingsWatcher } from '../util/SettingsWatcher';
import { readConfiguration } from '../util/getConfiguration';
import type { ServerMode } from './ServerMode';
import { StorybookServer } from './StorybookServer';
import { fetch } from './fetch';
import { processExecutions } from './processExecutions';

const CACHE_TTL_MS = 1000;

const getExternalServerUrl = () => {
  const rawSetting = readConfiguration(serverExternalUrlConfigSuffix);

  if (!rawSetting || typeof rawSetting !== 'string') {
    return 'http://localhost:6006';
  }

  return rawSetting;
};

const checkIfServerIsRunning = async (url: string) => {
  const iframeUrl = new URL('/iframe.html', url);
  const iframeUrlStr = iframeUrl.toString();

  try {
    const response = await fetch(iframeUrlStr, { timeout: 2000 });

    if (response.statusCode === 200) {
      logDebug(`External server at ${iframeUrlStr} returned 200`);
      return true;
    }

    logDebug(
      `External server at ${iframeUrlStr} returned ${
        response.statusCode ?? '[no status code]'
      }`,
    );
    return false;
  } catch (e) {
    logDebug(`Failed to reach external server at ${iframeUrlStr}`, e);
    // fall through
  }

  return false;
};

export interface ServerStatus {
  url: string | undefined;
  type: 'external' | 'externalDetected' | 'internal';
}

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

  private readonly externalServerCache: Map<string, number> = new Map();

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

  public async ensureServerHealthy(): Promise<ServerStatus> {
    if (!this.isInternalServerEnabled()) {
      return { url: getExternalServerUrl(), type: 'external' };
    }

    if (!this.server) {
      if (
        readConfiguration<boolean>(serverInternalPreferExternalConfigSuffix)
      ) {
        const externalServerUrl = getExternalServerUrl();
        const isExternalServerRunning = await this.checkIfServerIsRunning(
          externalServerUrl,
        );

        if (isExternalServerRunning) {
          logDebug(
            'External server appears to be running; using it instead of internal server',
          );
          return { url: externalServerUrl, type: 'externalDetected' };
        }
      }
    }

    return {
      url: await this.ensureServer().ensureServerHealthy(),
      type: 'internal',
    };
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

  private async checkIfServerIsRunning(url: string) {
    const cachedTimestamp = this.externalServerCache.get(url);

    if (cachedTimestamp && cachedTimestamp > Date.now() - CACHE_TTL_MS) {
      logDebug(`${url} is reachable according to cache`);
      return true;
    }

    const result = await checkIfServerIsRunning(url);

    if (result) {
      this.externalServerCache.set(url, Date.now());
    }

    return result;
  }
}
