import { workspace } from 'vscode';
import type { ConfigurationSuffix } from '../../types/ConfigurationSuffix';
import { readConfiguration } from '../../util/getConfiguration';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import { createProcessTask } from '../createProcessTask';
import { getBinPath } from '../getBinPath';
import { getSanitizedArgs } from '../getSanitizedArgs';

export const makeStartStorybookTaskCreator = (
  binPathConfig: ConfigurationSuffix,
  argsConfig: ConfigurationSuffix,
) => {
  return async ({ configDir, env }: TaskCreatorOptions) => {
    const binPath = await getBinPath(
      binPathConfig,
      'start-storybook',
      configDir,
    );

    if (!binPath) {
      return undefined;
    }

    const cwd = configDir
      ? workspace.getWorkspaceFolder(configDir)?.uri.fsPath
      : undefined;

    const args = getSanitizedArgs(readConfiguration(argsConfig));

    return createProcessTask(binPath, args ?? [], cwd, env);
  };
};

export const tryGetStartStorybookTask = makeStartStorybookTaskCreator(
  'server.internal.startStorybook.path',
  'server.internal.startStorybook.args',
);
