import { resolve } from 'path';
import { workspace } from 'vscode';

export const getWorkspaceRoot = () =>
  workspace.workspaceFolders?.[0]?.uri.path ?? resolve('/');
