import { workspace } from 'vscode';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { convertGlobForWorkspace } from '../globs/convertGlobForWorkspace';
import { logDebug } from '../log/log';

export const findFilesByGlob = async (globSpecifier: GlobSpecifier) => {
  const { globPattern, filter } = convertGlobForWorkspace(globSpecifier);

  const findResults = workspace.findFiles(globPattern);

  if (filter) {
    return findResults.then((uris) => {
      logDebug(
        `Found ${uris.length} URIs matching ${
          globSpecifier.files
        } under ${globSpecifier.directory.toString()}`,
      );
      return uris.filter(filter);
    });
  }

  return findResults;
};
