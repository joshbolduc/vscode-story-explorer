import type { Uri } from 'vscode';
import { Utils } from 'vscode-uri';
import { logDebug } from '../log/log';
import { FileWatcher, WatchListener } from './FileWatcher';
import { isVirtualUri } from './isVirtualUri';

export class RecursiveDeleteWatcher {
  private fsListeners: FileWatcher[] = [];

  public constructor(targetUri: Uri, callback: WatchListener) {
    if (isVirtualUri(targetUri)) {
      return;
    }

    const uris: Uri[] = [];

    let currentUri = targetUri;
    while (currentUri.toString() !== Utils.dirname(currentUri).toString()) {
      uris.push(currentUri);
      currentUri = Utils.dirname(currentUri);
    }

    logDebug('Watching for deletion on URIs', uris);

    this.fsListeners = uris.map(
      (uri) => new FileWatcher(uri, callback, true, true, false),
    );
  }

  public dispose() {
    this.fsListeners.forEach((listener) => listener.dispose());
    this.fsListeners = [];
  }
}
