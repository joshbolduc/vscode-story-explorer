import { Uri, workspace } from 'vscode';

export const tryStat = async (uri: Uri) => {
  try {
    return await workspace.fs.stat(uri);
  } catch (e) {
    return undefined;
  }
};
