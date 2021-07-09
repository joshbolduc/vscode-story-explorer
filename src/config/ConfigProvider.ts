import type { Event } from 'vscode';

export interface ConfigProvider<T> {
  onDidChangeConfig: Event<{ value: T } | undefined>;
  start(): { value: T } | Promise<{ value: T } | undefined> | undefined;
  stop(): void;
  dispose(): void;
}
