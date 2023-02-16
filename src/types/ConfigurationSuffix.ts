import type { ConfigurationKey } from '../types/ConfigurationKey';
import type { ConfigurationPrefix } from './ConfigurationPrefix';

export type ConfigurationSuffix =
  ConfigurationKey extends `${ConfigurationPrefix}.${infer U}` ? U : never;
