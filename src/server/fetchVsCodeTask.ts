import { Task, tasks } from 'vscode';
import type { TaskCreatorOptions } from './TaskCreatorOptions';

export const fetchVsCodeTask = async (
  { env }: TaskCreatorOptions,
  {
    type,
    filterFn,
  }: { type?: string | undefined; filterFn?: (task: Task) => boolean },
) => {
  const allTasks = await tasks.fetchTasks(type ? { type } : undefined);
  const matchingTask = allTasks.find((task) => !filterFn || filterFn(task));

  const execution = matchingTask?.execution;
  if (execution && 'options' in execution) {
    execution.options ??= {};
    execution.options.env = {
      ...execution.options?.env,
      ...env,
    };
  }

  return matchingTask;
};
