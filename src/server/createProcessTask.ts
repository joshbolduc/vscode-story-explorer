import { ProcessExecution, Task, TaskScope } from 'vscode';
import type { EnvironmentVariables } from './EnvironmentVariables';

export const createProcessTask = (
  binPath: string,
  args: string[],
  cwdPath: string | undefined,
  injectedEnv: EnvironmentVariables,
) =>
  new Task(
    { type: 'story-explorer' },
    TaskScope.Workspace,
    'Storybook Server',
    'Story Explorer',
    new ProcessExecution(binPath, args, {
      ...(cwdPath && { cwd: cwdPath }),
      env: injectedEnv,
    }),
  );
