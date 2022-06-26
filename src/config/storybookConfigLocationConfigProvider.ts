import { Utils } from 'vscode-uri';
import { getWorkspaceRoot } from '../util/getWorkspaceRoot';
import { SettingsConfigProvider } from './SettingsConfigProvider';
import type { StorybookConfigLocation } from './StorybookConfigLocation';
import { findConfigFileInDir } from './findConfigFileInDir';

export const storybookConfigLocationConfigProvider = new SettingsConfigProvider<
  StorybookConfigLocation,
  unknown
>('storybookConfigDir', async (rawValue: unknown) => {
  const sanitize = () => {
    if (typeof rawValue === 'string') {
      return rawValue;
    }

    return undefined;
  };

  const configDir = sanitize();
  if (!configDir) {
    return undefined;
  }

  const rootUri = getWorkspaceRoot();
  if (!rootUri) {
    return undefined;
  }

  const dir = Utils.resolvePath(rootUri, configDir);
  const file = await findConfigFileInDir(dir);

  return {
    value: {
      dir,
      file,
    },
  };
});
