import { basename, dirname, join } from 'path';
import type { GlobPattern } from 'vscode';
import { RelativePattern, Uri, workspace } from 'vscode';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { convertGlob } from './convertGlob';

const getRelativePatternForWorkspace = (
  globBasePath: string | undefined,
  globPattern: string,
) => {
  const dir = globBasePath ?? dirname(globPattern);
  const file = globBasePath !== undefined ? globPattern : basename(globPattern);

  const uri = Uri.file(dir);
  const workspaceFolder = workspace.getWorkspaceFolder(uri);

  if (workspaceFolder) {
    const pattern =
      workspaceFolder.uri.fsPath === uri.fsPath
        ? file
        : join(workspace.asRelativePath(uri, false), file);
    return new RelativePattern(workspaceFolder, pattern);
  }

  return new RelativePattern(dir, file);
};

export const convertGlobForWorkspace = (
  globSpecifier: GlobSpecifier,
): {
  globPattern: GlobPattern;
  filter?: (path: Uri) => boolean;
  regex?: RegExp;
} => {
  const { globBasePath, globPattern, filter, regex } =
    convertGlob(globSpecifier);

  return {
    globPattern: getRelativePatternForWorkspace(globBasePath, globPattern),
    filter: filter ? (uri) => filter(uri.path) : undefined,
    regex,
  };
};
