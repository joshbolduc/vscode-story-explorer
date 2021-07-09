import type { Event } from 'vscode';

export interface ConfigAggregator<T> {
  getConfig: () => T;
  onDidChangeConfig: Event<{ value: T }>;
}
