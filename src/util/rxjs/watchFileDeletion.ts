import { merge, NEVER } from 'rxjs';
import type { Uri } from 'vscode';
import { logDebug } from '../../log/log';
import { getUriAndParentUris } from '../getUriAndParentUris';
import { isVirtualUri } from '../guards/isVirtualUri';
import { watchFile } from './watchFile';

export const watchFileDeletion = (targetUri: Uri) => {
  if (isVirtualUri(targetUri)) {
    return NEVER;
  }

  const uris = getUriAndParentUris(targetUri);
  logDebug('Watching for deletion on URIs', uris);

  const watchers = uris.map((uri) => watchFile(uri, { watchDelete: true }));

  return merge(...watchers);
};
