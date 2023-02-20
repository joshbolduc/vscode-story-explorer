import type { Uri } from 'vscode';
import { Utils } from 'vscode-uri';

export const getUriAndParentUris = (initialUri: Uri, topmostUri?: Uri) => {
  const uris: Uri[] = [];

  let currentUri = initialUri;
  do {
    uris.push(currentUri);
    currentUri = Utils.dirname(currentUri);
  } while (
    currentUri.toString() !== Utils.dirname(currentUri).toString() &&
    currentUri.toString() !== topmostUri?.toString()
  );

  return uris;
};
