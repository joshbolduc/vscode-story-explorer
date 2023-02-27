import { gte } from 'semver';
import { Uri, workspace } from 'vscode';
import { readConfiguration } from '../../util/getConfiguration';
import { getInstalledPackageVersion } from '../../util/getInstalledPackageVersion';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import { createProcessTask } from '../createProcessTask';
import { getDetectedBinPath } from '../getBinPath';
import { getSanitizedArgs } from '../getSanitizedArgs';

const getStorybookCliLocation = async (configDir: Uri | undefined) => {
  const configPath = readConfiguration('server.internal.storybook.path');
  if (isNonEmptyString(configPath)) {
    return configPath;
  }

  const binPath = await getDetectedBinPath(
    'storybook',
    configDir,
    async (uri) => {
      try {
        const version = await getInstalledPackageVersion('@storybook/cli', uri);

        if (typeof version === 'string' && gte(version, '7.0.0-alpha.0')) {
          return true;
        }
      } catch {
        // no-op; likely package.json couldn't be found or parsed
      }

      return false;
    },
  );

  return binPath;
};

export const tryGetStorybookCliTask = async ({
  configDir,
  env,
}: TaskCreatorOptions) => {
  const binPath = await getStorybookCliLocation(configDir);

  if (!binPath) {
    return undefined;
  }

  const cwd = configDir
    ? workspace.getWorkspaceFolder(configDir)?.uri.fsPath
    : undefined;

  const args = getSanitizedArgs(
    readConfiguration('server.internal.storybook.args'),
  );

  return createProcessTask(binPath, ['dev', ...(args ?? [])], cwd, env);
};
