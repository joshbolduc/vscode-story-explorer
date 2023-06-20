import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import type {
  CancellationToken,
  Task,
  TaskExecution,
  TaskProcessEndEvent,
  TaskProcessStartEvent,
} from 'vscode';
import { tasks, window } from 'vscode';
import { logDebug, logError } from '../log/log';
import { openWorkspaceSetting } from '../util/openWorkspaceSetting';
import { TaskProcessListener } from './TaskProcessListener';

export class TaskExecutor {
  private listener?: TaskProcessListener | undefined;
  private execution?: TaskExecution | undefined;

  public constructor(
    private readonly taskFactory: () => Promise<
      { task: Task; execution: TaskExecution | undefined } | undefined
    >,
    private readonly onStart: (e: TaskProcessStartEvent) => void,
    private readonly onEnd: (e: TaskProcessEndEvent) => void,
  ) {}

  public async start(
    token: CancellationToken,
    processExecutions: Observable<Map<TaskExecution, number>>,
  ) {
    const result = await this.taskFactory();
    if (token.isCancellationRequested) {
      return;
    }

    if (!result) {
      const showLaunchErrorMessage = async () => {
        const openSettingsItem = 'Open Settings';

        const choice = await window.showErrorMessage(
          "Launching the Storybook server failed. If this project uses Storybook, you may need to install your project's dependencies, or change your launch strategy in settings.",
          openSettingsItem,
        );

        if (choice === openSettingsItem) {
          await openWorkspaceSetting('storyExplorer.server.internal');
        }
      };

      showLaunchErrorMessage().catch((e) => {
        logError('Failed to handle server launch error message', e);
      });

      throw new Error('Failed to find path to launch Storybook server');
    }

    const { execution, task } = result;

    let processId: number | undefined;
    if (execution) {
      const executions = await firstValueFrom(processExecutions);
      processId = executions.get(execution);

      if (!processId) {
        logDebug(
          'Unable to determine process ID for existing execution; launching new task instead',
        );
      }
    } else {
      logDebug('No existing execution found; launching new task');
    }

    this.execution =
      execution && processId ? execution : await tasks.executeTask(task);

    if (token.isCancellationRequested) {
      this.execution.terminate();
      this.execution = undefined;
      return;
    }

    this.listener = new TaskProcessListener(
      this.execution,
      this.onStart,
      this.onEnd,
    );

    // If we have a process ID, it's because the process has already started, so
    // we need to trigger the `onStart` listener here.
    if (processId) {
      logDebug(
        `Found existing execution using process ID ${processId}; reusing it`,
      );
      this.onStart({ execution: this.execution, processId });
    }
  }

  public stop() {
    this.execution?.terminate();
    this.execution = undefined;
    this.listener?.dispose();
    this.listener = undefined;
  }

  public dispose() {
    this.stop();
  }
}
