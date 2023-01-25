import type { Event } from 'vscode';
import type { ValueOrPromise } from '../util/ValueOrPromise';

export interface ConfigProvider<T> {
  onDidChangeConfig: Event<{ value: T } | undefined>;
  start(): ValueOrPromise<{ value: T } | undefined>;
  stop(): void;
  dispose(): void;
}
