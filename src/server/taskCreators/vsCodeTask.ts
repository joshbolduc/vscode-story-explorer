import { readConfiguration } from '../../util/getConfiguration';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import { fetchVsCodeTask } from '../fetchVsCodeTask';

export const tryGetVsCodeTask = (taskOptions: TaskCreatorOptions) => {
  const taskName = readConfiguration('server.internal.task.label');

  if (!isNonEmptyString(taskName)) {
    return;
  }

  const rawType = readConfiguration('server.internal.task.type');
  const type = isNonEmptyString(rawType) ? rawType : undefined;

  return fetchVsCodeTask(taskOptions, {
    filterFn: (task) =>
      task.name === taskName &&
      // For some reason, filtering by type via `tasks.fetchTasks` doesn't seem
      // to work for arbitrary types, so we'll filter it ourselves.
      (!type || task.definition.type === type),
  });
};
