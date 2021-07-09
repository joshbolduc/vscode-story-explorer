import { workspace } from 'vscode';
import { convertGlobForWorkspace } from '../globs/convertGlobForWorkspace';
import { logDebug } from '../log/log';

const findFilesByGlob = async (glob: string, globBasePath: string) => {
  const { globPattern, filter } = convertGlobForWorkspace(glob, globBasePath);

  const findResults = workspace.findFiles(globPattern);

  if (filter) {
    return findResults.then((uris) => {
      logDebug(
        `Found ${uris.length} URIs matching ${glob} under ${globBasePath}`,
      );
      return uris.filter(filter);
    });
  }

  return findResults;
};

export const findFilesByGlobs = async (
  globs: string[],
  globBasePath: string,
) => {
  return (
    await Promise.all(globs.map((glob) => findFilesByGlob(glob, globBasePath)))
  ).flat();
};
