import { isDeepStrictEqual } from 'util';
import { firstValueFrom } from 'rxjs';
import { tasks } from 'vscode';
import { storybookConfigLocation } from '../config/storybookConfigLocation';
import { serverInternalEnvironmentVariablesConfigSuffix } from '../constants/constants';
import { logDebug } from '../log/log';
import { readConfiguration } from '../util/getConfiguration';
import type { EnvironmentVariables } from './EnvironmentVariables';
import type { TaskCreatorOptions } from './TaskCreatorOptions';
import { getLaunchStrategy } from './launchStrategy';
import { tryGetCustomCommandTask } from './taskCreators/customCommand';
import { tryGetNpmScriptTask } from './taskCreators/npmScript';
import { tryGetStartStorybookTask } from './taskCreators/startStorybook';
import { tryGetStartStorybookLegacyTask } from './taskCreators/startStorybookLegacy';
import { tryGetStorybookCliTask } from './taskCreators/storybookCli';
import { tryGetVsCodeTask } from './taskCreators/vsCodeTask';

const getEnvironmentVariables = () => {
  const rawConfig = readConfiguration(
    serverInternalEnvironmentVariablesConfigSuffix,
  );

  if (rawConfig && typeof rawConfig === 'object') {
    return Object.entries(rawConfig).reduce<EnvironmentVariables>(
      (acc, [key, value]) => {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          acc[key] = value.toString();
        }

        return acc;
      },
      {},
    );
  }

  return undefined;
};

const customCommandCreator = {
  name: 'custom command',
  fn: tryGetCustomCommandTask,
};
const npmScriptCreator = { name: 'npm script', fn: tryGetNpmScriptTask };
const startStorybookCreator = {
  name: 'start-storybook',
  fn: tryGetStartStorybookTask,
};
const startStorybookLegacyCreator = {
  name: 'legacy start-storybook',
  fn: tryGetStartStorybookLegacyTask,
};
const storybookCliCreator = { name: 'storybook', fn: tryGetStorybookCliTask };
const vsCodeCreator = { name: 'vscode task', fn: tryGetVsCodeTask };

const getPrioritizedTaskCreators = () => {
  const launchStrategy = getLaunchStrategy();

  switch (launchStrategy) {
    case 'npm':
      return [npmScriptCreator];
    case 'task':
      return [vsCodeCreator];
    case 'start-storybook':
      return [startStorybookCreator];
    case 'storybook':
      return [storybookCliCreator];
    case 'custom':
      return [customCommandCreator];
    case 'detect': {
      return [
        // These are tried first because these settings likely only exist if the
        // user intended for them to be used.
        vsCodeCreator,
        customCommandCreator,
        startStorybookLegacyCreator,

        // The following task creators are ones that should plausibly work in
        // the right setup (i.e., the right Storybook version, with no esoteric
        // modifications) without any special configuration.
        storybookCliCreator,
        startStorybookCreator,
        npmScriptCreator,
      ];
    }
  }
};

const tryCreateTask = async (taskOptions: TaskCreatorOptions) => {
  const taskCreators = getPrioritizedTaskCreators();

  for (const { fn, name } of taskCreators) {
    const result = await fn(taskOptions);

    if (result) {
      logDebug(`Attempting launch using ${name} creator`);
      return result;
    }
  }
};

export const getOrCreateTask = async () => {
  const configDir = (
    await firstValueFrom(storybookConfigLocation, {
      defaultValue: undefined,
    })
  )?.dir;

  const injectedEnv = {
    CI: 'true',
    ...(configDir && { SBCONFIG_CONFIG_DIR: configDir.fsPath }),
    ...getEnvironmentVariables(),
  };

  const task = await tryCreateTask({ configDir, env: injectedEnv });

  if (!task) {
    return undefined;
  }

  const existingExecution = tasks.taskExecutions.find(
    (execution) =>
      isDeepStrictEqual(execution.task.definition, task.definition) &&
      isDeepStrictEqual(execution.task.scope, task.scope),
  );

  return { task, execution: existingExecution };
};
