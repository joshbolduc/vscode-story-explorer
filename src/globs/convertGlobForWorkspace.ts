import type { GlobPattern, Uri } from 'vscode';
import { convertGlob } from './convertGlob';
import { getRelativePatternForWorkspace } from './getRelativePatternForWorkspace';

export const convertGlobForWorkspace = (
  glob: string,
  globBasePath: string,
): {
  globPattern: GlobPattern;
  filter?: (path: Uri) => boolean;
  regex?: RegExp;
} => {
  const {
    globBasePath: convertedBasePath,
    globPattern,
    filter,
    regex,
  } = convertGlob(glob, globBasePath);

  return {
    globPattern: getRelativePatternForWorkspace(convertedBasePath, globPattern),
    filter: filter ? (uri) => filter(uri.path) : undefined,
    regex,
  };
};
