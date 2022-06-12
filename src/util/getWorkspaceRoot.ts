import { workspace } from 'vscode';
import { Utils } from 'vscode-uri';

export const getWorkspaceRoot = () => {
  if (workspace.workspaceFile) {
    return Utils.dirname(workspace.workspaceFile);
  }

  return workspace.workspaceFolders?.[0]?.uri;
};
