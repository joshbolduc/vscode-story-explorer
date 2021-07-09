import {
  CancellationToken,
  Disposable,
  FileSystemWatcher,
  GlobPattern,
  Uri,
  workspace,
} from 'vscode';

export type WatchListener = (
  uri: Uri,
  type: 'create' | 'change' | 'delete',
) => void;

export class FileWatcher {
  private fsWatcher?: FileSystemWatcher;

  private readonly listenerDisposables: Disposable[] = [];

  public constructor(
    private readonly glob: GlobPattern,
    private readonly callback: WatchListener,
    ignoreCreate = false,
    ignoreChange = false,
    ignoreDelete = false,
  ) {
    this.init(callback, ignoreCreate, ignoreChange, ignoreDelete);
  }

  public find(
    exclude?: GlobPattern,
    maxResults?: number,
    token?: CancellationToken,
  ) {
    return workspace.findFiles(this.glob, exclude, maxResults, token);
  }

  public async findWithCallback(
    exclude?: GlobPattern,
    maxResults?: number,
    token?: CancellationToken,
  ) {
    const findResults = await workspace.findFiles(
      this.glob,
      exclude,
      maxResults,
      token,
    );

    findResults.forEach((uri) => {
      this.callback(uri, 'create');
    });
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
