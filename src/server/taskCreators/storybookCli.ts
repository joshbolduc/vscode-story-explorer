import { gte } from 'semver';
import { Uri, workspace } from 'vscode';
import { readConfiguration } from '../../util/getConfiguration';
import { getUriAndParentUris } from '../../util/getUriAndParentUris';
import { hasProperty } from '../../util/guards/hasProperty';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import { tryStat } from '../../util/tryStat';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import { createProcessTask } from '../createProcessTask';
import { getDetectedBinPath } from '../getBinPath';
import { getSanitizedArgs } from '../getSanitizedArgs';

const locatePackageJson = async (uri: Uri) => {
  for (const dir of getUriAndParentUris(uri)) {
    const proposedUri = Uri.joinPath(dir, 'package.json');
    if (await tryStat(proposedUri)) {
      return proposedUri;
    }
  }

  return undefined;
};

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
        const cliEntryPath = require.resolve('@storybook/cli', {
          paths: [uri.fsPath],
        });

        const packageJsonLocation = await locatePackageJson(
          Uri.file(cliEntryPath),
        );

        if (!packageJsonLocation) {
          return false;
        }

        const packageJsonContents = (
          await workspace.fs.readFile(packageJsonLocation)
        ).toString();

        const packageJsonParsed = JSON.parse(packageJsonContents) as unknown;

        if (!hasProperty('version')(packageJsonParsed)) {
          return false;
        }

        const { version } = packageJsonParsed;

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
