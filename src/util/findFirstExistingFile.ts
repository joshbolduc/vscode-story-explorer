import type { Uri } from 'vscode';
import { tryStat } from './tryStat';

export const findFirstExistingFile = async (uris: Uri[]) => {
  for (const uri of uris) {
    if (await tryStat(uri)) {
      return uri;
    }
  }

  return undefined;
};
