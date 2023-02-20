import { ProcessExecution, Task, TaskRevealKind, TaskScope } from 'vscode';
import type { EnvironmentVariables } from './EnvironmentVariables';

export const createProcessTask = (
  binPath: string,
  args: string[],
  cwdPath: string | undefined,
  injectedEnv: EnvironmentVariables,
) => {
  const task = new Task(
    { type: 'story-explorer' },
    TaskScope.Workspace,
    'Storybook Server',
    'Story Explorer',
    new ProcessExecution(binPath, args, {
      ...(cwdPath && { cwd: cwdPath }),
      env: injectedEnv,
    }),
  );

  task.isBackground = true;
  task.detail = 'Storybook Development Server';
  task.presentationOptions = {
    reveal: TaskRevealKind.Silent,
  };

  return task;
};
