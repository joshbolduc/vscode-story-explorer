import { firstValueFrom } from 'rxjs';
import { gte, lt } from 'semver';
import type { Uri } from 'vscode';
import { workspace } from 'vscode';
import { readConfiguration } from '../../util/getConfiguration';
import { getInstalledPackageVersion } from '../../util/getInstalledPackageVersion';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import { storybookVersion } from '../../versions/storybookVersion';
import { VERSION_7_x_ALPHA } from '../../versions/versions';
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

        if (typeof version === 'string' && gte(version, VERSION_7_x_ALPHA)) {
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

// https://github.com/storybookjs/storybook/issues/21055
const shouldInjectEnvFlags = async () => {
  const version = await firstValueFrom(storybookVersion);
  return gte(version, VERSION_7_x_ALPHA) && lt(version, '7.0.0-rc.7');
};

const getAdjustedArgs = (args: string[], configDirPath: string | undefined) => {
  return [
    ...(args.includes('--ci') ? [] : ['--ci']),
    ...(args.includes('--config-dir') || args.includes('-c') || !configDirPath
      ? []
      : ['--config-dir', configDirPath]),
    ...args,
  ];
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

  const userSuppliedArgs =
    getSanitizedArgs(readConfiguration('server.internal.storybook.args')) ?? [];

  const args = (await shouldInjectEnvFlags())
    ? getAdjustedArgs(userSuppliedArgs, configDir?.fsPath)
    : userSuppliedArgs;

  return createProcessTask(binPath, ['dev', ...args], cwd, env);
};
