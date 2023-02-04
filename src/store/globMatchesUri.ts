import type { Uri } from 'vscode';
import type { ConvertedGlob } from '../globs/convertGlob';

export const globMatchesUri = (glob: ConvertedGlob, uri: Uri) => {
  if (glob.filter) {
    return glob.filter(uri);
  }

  return glob.globBase.toString() === uri.toString();
};
