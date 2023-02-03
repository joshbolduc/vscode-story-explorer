import { map, startWith } from 'rxjs';
import { workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import { deferAndShare } from './rxjs/deferAndShare';
import { fromVsCodeEvent } from './rxjs/fromVsCodeEvent';

const getWorkspaceRoot = () => {
  if (
    workspace.workspaceFile &&
    workspace.workspaceFile.scheme !== 'untitled'
  ) {
    return Utils.dirname(workspace.workspaceFile);
  }

  return workspace.workspaceFolders?.[0]?.uri;
};

export const workspaceRoot = deferAndShare(() =>
  fromVsCodeEvent(workspace.onDidChangeWorkspaceFolders).pipe(
    startWith(undefined),
    map(() => getWorkspaceRoot()),
  ),
);
