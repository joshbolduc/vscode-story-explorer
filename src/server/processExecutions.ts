import { merge, scan } from 'rxjs';
import { TaskExecution, tasks } from 'vscode';
import { hasProperty } from '../util/guards/hasProperty';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { fromVsCodeEvent } from '../util/rxjs/fromVsCodeEvent';

export const processExecutions = deferAndShare(() =>
  merge(
    fromVsCodeEvent(tasks.onDidStartTaskProcess),
    fromVsCodeEvent(tasks.onDidEndTaskProcess),
  ).pipe(
    scan((acc, value) => {
      if (hasProperty('processId')(value)) {
        acc.set(value.execution, value.processId);
      } else {
        acc.delete(value.execution);
      }
      return acc;
    }, new Map<TaskExecution, number>()),
  ),
);
