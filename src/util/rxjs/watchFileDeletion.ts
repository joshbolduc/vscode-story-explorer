import { merge, NEVER } from 'rxjs';
import type { Uri } from 'vscode';
import { Utils } from 'vscode-uri';
import { logDebug } from '../../log/log';
import { isVirtualUri } from '../guards/isVirtualUri';
import { watchFile } from './watchFile';

const getUriAndParentUris = (initialUri: Uri) => {
  const uris: Uri[] = [];

  let currentUri = initialUri;
  while (currentUri.toString() !== Utils.dirname(currentUri).toString()) {
    uris.push(currentUri);
    currentUri = Utils.dirname(currentUri);
  }

  return uris;
};

export const watchFileDeletion = (targetUri: Uri) => {
  if (isVirtualUri(targetUri)) {
    return NEVER;
  }

  const uris = getUriAndParentUris(targetUri);
  logDebug('Watching for deletion on URIs', uris);

  const watchers = uris.map((uri) => watchFile(uri, { watchDelete: true }));

  return merge(...watchers);
};
