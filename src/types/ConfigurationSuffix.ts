import type { ConfigurationKey } from '../types/ConfigurationKey';
import type { ConfigurationPrefix } from './ConfigurationPrefix';

type HiddenConfigurationSuffix = 'storybookVersion';

export type ConfigurationSuffix =
  | HiddenConfigurationSuffix
  | (ConfigurationKey extends `${ConfigurationPrefix}.${infer U}` ? U : never);
