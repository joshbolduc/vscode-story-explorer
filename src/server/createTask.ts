import {
  ProcessExecution,
  Task,
  TaskRevealKind,
  TaskScope,
  Uri,
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
  cwd: Uri | undefined,
  configDir: Uri | undefined,
) => {
  const cwdPath = cwd?.fsPath;
  const processExecution = new ProcessExecution(binPath, getArgs() ?? [], {
    ...(cwdPath && { cwd: cwdPath }),
    env: {
      CI: 'true',
      ...(configDir && { SBCONFIG_CONFIG_DIR: configDir.fsPath }),
      ...getEnvironmentVariables(),
    },
  });

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
