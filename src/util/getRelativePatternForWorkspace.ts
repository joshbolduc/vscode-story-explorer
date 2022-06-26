import { join } from 'path';
import { RelativePattern, Uri, workspace } from 'vscode';
import { Utils } from 'vscode-uri';

export const getRelativePatternForWorkspace = (
  base: Uri,
  pattern: string | undefined,
) => {
  const workspaceFolder = workspace.getWorkspaceFolder(base);

  const dir = pattern !== undefined ? base : Utils.dirname(base);
  const file = pattern !== undefined ? pattern : Utils.basename(base);

  if (workspaceFolder) {
    const relativePattern =
      workspaceFolder.uri.toString() === dir.toString()
        ? file
        : join(workspace.asRelativePath(dir, false), file);
    return new RelativePattern(workspaceFolder, relativePattern);
  }

  return new RelativePattern(dir, file);
};
