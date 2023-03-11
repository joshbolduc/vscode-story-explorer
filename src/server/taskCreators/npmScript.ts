import { TaskDefinition, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import { readConfiguration } from '../../util/getConfiguration';
import { hasProperty } from '../../util/guards/hasProperty';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import { isTruthy } from '../../util/guards/isTruthy';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import { fetchVsCodeTask } from '../fetchVsCodeTask';

interface NpmTaskDefinition extends TaskDefinition {
  readonly type: 'npm';
  /**
   * Path to the package.json directory, relative to the workspace. If not set,
   * implies workspace root.
   */
  path?: string;
  /**
   * Name of the script
   */
  script: string;
}

export const tryGetNpmScriptTask = async (taskOptions: TaskCreatorOptions) => {
  const script = readConfiguration<string>(
    'server.internal.npm.script',
    'storybook',
  );

  if (!isNonEmptyString(script)) {
    return;
  }

  const packageDir = readConfiguration('server.internal.npm.dir');

  return await fetchVsCodeTask(taskOptions, {
    type: 'npm',
    filterFn: (task) => {
      const definition = task.definition as NpmTaskDefinition;

      if (definition.script !== script) {
        return false;
      }

      if (typeof packageDir === 'string') {
        const workspaceDir = taskOptions.configDir
          ? workspace.getWorkspaceFolder(taskOptions.configDir)?.uri
          : undefined;

        if (!workspaceDir || !hasProperty('uri')(task.scope)) {
          return false;
        }

        const targetDir = Utils.joinPath(workspaceDir, packageDir);

        const taskDir = Utils.joinPath(
          task.scope.uri,
          ...[definition.path].filter(isTruthy),
        );

        if (taskDir.toString() !== targetDir.toString()) {
          return false;
        }
      }

      return true;
    },
  });
};
