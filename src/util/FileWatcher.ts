import type { Disposable, FileSystemWatcher, GlobPattern, Uri } from 'vscode';
import { workspace } from 'vscode';

export type WatchListener = (
  uri: Uri,
  type: 'create' | 'change' | 'delete',
) => void;

export class FileWatcher {
  private fsWatcher?: FileSystemWatcher | undefined;

  private readonly glob: GlobPattern;

  private readonly listenerDisposables: Disposable[] = [];

  public constructor(
    patternOrUri: GlobPattern | Uri,
    callback: WatchListener,
    ignoreCreate = false,
    ignoreChange = false,
    ignoreDelete = false,
  ) {
    this.glob =
      typeof patternOrUri === 'string' || 'pattern' in patternOrUri
        ? patternOrUri
        : patternOrUri.fsPath;
    this.init(callback, ignoreCreate, ignoreChange, ignoreDelete);
  }

  public dispose() {
    this.listenerDisposables.forEach((disposable) => {
      disposable.dispose();
    });
    this.fsWatcher?.dispose();
    this.fsWatcher = undefined;
  }

  private init(
    callback: WatchListener,
    ignoreCreate: boolean,
    ignoreChange: boolean,
    ignoreDelete: boolean,
  ) {
    this.fsWatcher = workspace.createFileSystemWatcher(
      this.glob,
      ignoreCreate,
      ignoreChange,
      ignoreDelete,
    );

    this.listenerDisposables.push(
      this.fsWatcher.onDidChange((uri) => {
        callback(uri, 'change');
      }),
      this.fsWatcher.onDidCreate((uri) => {
        callback(uri, 'create');
      }),
      this.fsWatcher.onDidDelete((uri) => {
        callback(uri, 'delete');
      }),
    );
  }
}
