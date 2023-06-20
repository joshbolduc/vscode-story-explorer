import type { ConfigurationScope } from 'vscode';
import { workspace } from 'vscode';
import { configPrefix } from '../constants/constants';
import type { ConfigurationSuffix } from '../types/ConfigurationSuffix';

export const getConfiguration = (scope?: ConfigurationScope) =>
  workspace.getConfiguration(configPrefix, scope);

export function readConfiguration<T>(
  section: ConfigurationSuffix,
): T | undefined;
export function readConfiguration<T>(
  section: ConfigurationSuffix,
  defaultValue: T,
): T;
export function readConfiguration<T>(
  section: ConfigurationSuffix,
  defaultValue?: T,
): T | undefined {
  return getConfiguration().get<T | undefined>(section, defaultValue);
}
