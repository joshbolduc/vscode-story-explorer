import { resolve } from 'path';
import { Uri } from 'vscode';
import { getWorkspaceRoot } from '../util/getWorkspaceRoot';
import { SettingsConfigProvider } from './SettingsConfigProvider';
import type { StorybookConfigLocation } from './StorybookConfigLocation';

export const storybookConfigLocationConfigProvider = new SettingsConfigProvider<
  StorybookConfigLocation,
  unknown
>('storybookConfigDir', (rawValue: unknown) => {
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

  const rootPath = getWorkspaceRoot();
  const dir = Uri.file(resolve(rootPath, configDir));
  const file = Uri.joinPath(dir, 'main.js');
  return configDir
    ? {
        value: {
          dir,
          file,
        },
      }
    : undefined;
});
