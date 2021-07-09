import { dirname } from 'path';
import type { Uri } from 'vscode';
import { logDebug } from '../log/log';
import { FileWatcher, WatchListener } from './FileWatcher';

export class RecursiveDeleteWatcher {
  private fsListeners: FileWatcher[];

  public constructor(uri: Uri, callback: WatchListener) {
    const paths: string[] = [];

    let uriPath = uri.path;
    while (uriPath !== dirname(uriPath)) {
      paths.push(uriPath);
      uriPath = dirname(uriPath);
    }

    logDebug('Watching for deletion on paths', paths);

    this.fsListeners = paths.map(
      (path) => new FileWatcher(path, callback, true, true, false),
    );
  }

  public dispose() {
    this.fsListeners.forEach((listener) => listener.dispose());
    this.fsListeners = [];
  }
}
