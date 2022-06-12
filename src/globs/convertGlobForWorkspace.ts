import { join } from 'path';
import { RelativePattern, Uri, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { convertGlob } from './convertGlob';

const getRelativePatternForWorkspace = (
  globBasePath: Uri,
  globPattern: string | undefined,
) => {
  const workspaceFolder = workspace.getWorkspaceFolder(globBasePath);

  const dir =
    globPattern !== undefined ? globBasePath : Utils.dirname(globBasePath);
  const file =
    globPattern !== undefined ? globPattern : Utils.basename(globBasePath);

  if (workspaceFolder) {
    const pattern =
      workspaceFolder.uri.toString() === dir.toString()
        ? file
        : join(workspace.asRelativePath(dir, false), file);
    return new RelativePattern(workspaceFolder, pattern);
  }

  return new RelativePattern(dir, file);
};

export const convertGlobForWorkspace = (globSpecifier: GlobSpecifier) => {
  const { globBase, globPattern, filter, regex } = convertGlob(globSpecifier);

  return {
    globPattern: getRelativePatternForWorkspace(globBase, globPattern),
    filter,
    regex,
  };
};
