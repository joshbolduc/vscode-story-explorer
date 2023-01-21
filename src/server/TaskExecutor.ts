import {
  CancellationToken,
  Task,
  TaskExecution,
  TaskProcessEndEvent,
  TaskProcessStartEvent,
  tasks,
  window,
} from 'vscode';
import { serverInternalStorybookBinaryPathConfig } from '../constants/constants';
import { logError } from '../log/log';
import { openWorkspaceSetting } from '../util/openWorkspaceSetting';
import { TaskProcessListener } from './TaskProcessListener';

export class TaskExecutor {
  private listener?: TaskProcessListener | undefined;
  private execution?: TaskExecution | undefined;

  public constructor(
    private readonly taskFactory: () => Promise<Task | undefined>,
    private readonly onStart: (e: TaskProcessStartEvent) => void,
    private readonly onEnd: (e: TaskProcessEndEvent) => void,
  ) {}

  public async start(token: CancellationToken) {
    const task = await this.taskFactory();
    if (token.isCancellationRequested) {
      return;
    }

    if (!task) {
      const showLaunchErrorMessage = async () => {
        const openSettingsItem = 'Open Settings';

        const choice = await window.showErrorMessage(
          "Launching the Storybook server failed. The path to the Storybook server script couldn't be determined. If this project uses Storybook, you may need to install your project's dependencies, or specify a path manually in settings.",
          openSettingsItem,
        );

        if (choice === openSettingsItem) {
          await openWorkspaceSetting(serverInternalStorybookBinaryPathConfig);
        }
      };

      showLaunchErrorMessage().catch((e) => {
        logError('Failed to handle server launch error message', e);
      });

      throw new Error('Failed to find path to launch Storybook server');
    }

    this.execution = await tasks.executeTask(task);

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
