import { join } from 'path';
import { RelativePattern, Uri, workspace } from 'vscode';

export const getRelativePatternForWorkspace = (
  globBasePath: string,
  globPattern: string,
) => {
  const uri = Uri.file(globBasePath);
  const workspaceFolder = workspace.getWorkspaceFolder(uri);

  if (workspaceFolder) {
    const pattern =
      workspaceFolder.uri.fsPath === uri.fsPath
        ? globPattern
        : join(workspace.asRelativePath(uri), globPattern);
    return new RelativePattern(workspaceFolder, pattern);
  }

  return new RelativePattern(globBasePath, globPattern);
};
