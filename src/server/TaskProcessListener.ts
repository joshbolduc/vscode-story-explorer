import {
  Disposable,
  TaskExecution,
  TaskProcessEndEvent,
  TaskProcessStartEvent,
  tasks,
} from 'vscode';

export class TaskProcessListener {
  private startListener: Disposable | undefined;
  private endListener: Disposable | undefined;

  public constructor(
    private readonly execution: TaskExecution,
    onStart: (e: TaskProcessStartEvent) => void,
    onEnd: (e: TaskProcessEndEvent) => void,
  ) {
    this.startListener = tasks.onDidStartTaskProcess((e) => {
      if (e.execution !== this.execution) {
        return;
      }

      onStart(e);

      this.startListener?.dispose();
      this.startListener = undefined;
    });

    this.endListener = tasks.onDidEndTaskProcess((e) => {
      if (e.execution !== this.execution) {
        return;
      }

      onEnd(e);

      this.endListener?.dispose();
      this.endListener = undefined;
    });
  }

  public dispose() {
    this.startListener?.dispose();
    this.endListener?.dispose();
  }
}
