import { isDeepStrictEqual } from 'util';
import { Disposable, EventEmitter } from 'vscode';
import { logError } from '../log/log';
import type { ConfigProvider } from './ConfigProvider';

class ProviderWrapper<T> {
  private started = false;
  private readonly listener: Disposable;
  private cachedResult?: { value: T };

  public constructor(
    private readonly provider: ConfigProvider<T>,
    handler: (e: { value: T } | undefined) => void,
  ) {
    this.listener = provider.onDidChangeConfig((result) => {
      this.cachedResult = result;
      handler(result);
    });
  }

  public async start() {
    if (!this.started) {
      this.started = true;
      this.cachedResult = await this.provider.start();
    }

    return this.cachedResult;
  }

  public stop() {
    if (this.started) {
      this.started = false;
      this.provider.stop();
    }
  }

  public getCachedResult() {
    return this.cachedResult;
  }

  public dispose() {
    this.stop();
    this.provider.dispose();
    this.listener.dispose();
  }
}

export class Aggregator<T> {
  private readonly providers: ProviderWrapper<T>[];

  private lastValue?: T;
  private hasFired = false;

  private readonly onDidChangeConfigEmitter = new EventEmitter<T | undefined>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeConfig = this.onDidChangeConfigEmitter.event;

  public constructor(providers: ConfigProvider<T>[]) {
    this.providers = providers.map((provider) => {
      const providerWrapper = new ProviderWrapper(provider, () => {
        this.init().catch((e) => {
          logError('Failed to initialize ConfigProvider', e);
        });
      });

      return providerWrapper;
    });
  }

  public async init() {
    let result: T | undefined;

    for (const provider of this.providers) {
      if (result) {
        provider.stop();
      } else {
        const startResult = await provider.start();

        if (startResult) {
          result = startResult.value;
        }
      }
    }

    this.fire(result);

    return result;
  }

  public getValue() {
    for (const provider of this.providers) {
      const cachedResult = provider.getCachedResult();
      if (cachedResult) {
        return cachedResult.value;
      }
    }

    return undefined;
  }

  public dispose() {
    this.providers.forEach((provider) => {
      provider.dispose();
    });
    this.onDidChangeConfigEmitter.dispose();
  }

  private fire(value: T | undefined) {
    if (this.hasFired && isDeepStrictEqual(value, this.lastValue)) {
      return;
    }

    this.hasFired = true;
    this.lastValue = value;
    this.onDidChangeConfigEmitter.fire(value);
  }
}
