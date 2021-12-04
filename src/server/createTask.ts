import {
  ProcessExecution,
  Task,
  TaskRevealKind,
  TaskScope,
  workspace,
} from 'vscode';
import {
  configPrefix,
  serverInternalCommandLineArgsConfigSuffix,
  serverInternalEnvironmentVariablesConfigSuffix,
} from '../constants/constants';

const getEnvironmentVariables = () => {
  const rawConfig = workspace
    .getConfiguration(configPrefix)
    .get(serverInternalEnvironmentVariablesConfigSuffix);

  if (rawConfig && typeof rawConfig === 'object') {
    return Object.entries(rawConfig).reduce<Record<string, string>>(
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

const getArgs = () => {
  const rawConfig = workspace
    .getConfiguration(configPrefix)
    .get(serverInternalCommandLineArgsConfigSuffix);

  if (
    Array.isArray(rawConfig) &&
    rawConfig.every(
      (item): item is string | number =>
        typeof item === 'string' || typeof item === 'number',
    )
  ) {
    return rawConfig.map((item) => item.toString());
  }

  return undefined;
};

export const createTask = (
  binPath: string,
  cwd: string,
  configDirPath: string | undefined,
) => {
  const processExecution = new ProcessExecution(
    'node',
    [binPath, ...(getArgs() ?? [])],
    {
      cwd,
      env: {
        CI: 'true',
        ...(configDirPath && { SBCONFIG_CONFIG_DIR: configDirPath }),
        ...getEnvironmentVariables(),
      },
    },
  );

  const task = new Task(
    { type: 'storyExplorerTask' },
    TaskScope.Workspace,
    'Storybook Server',
    'Story Explorer',
    processExecution,
  );
  task.isBackground = true;
  task.detail = 'Storybook Development Server';
  task.presentationOptions = {
    reveal: TaskRevealKind.Silent,
  };

  return task;
};
