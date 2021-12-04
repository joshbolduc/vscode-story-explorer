import { logWarn } from '../log/log';
import type { StorybookConfig } from './StorybookConfig';

const requireUncached = <T>(filePath: string): T => {
  delete require.cache[require.resolve(filePath)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(filePath) as T;
};

export const parseConfigFile = (configFilePath: string) => {
  try {
    return requireUncached<StorybookConfig>(configFilePath);
  } catch (e) {
    logWarn('Failed to read config file', e, configFilePath);
  }

  return undefined;
};
