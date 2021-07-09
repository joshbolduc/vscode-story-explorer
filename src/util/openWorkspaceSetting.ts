import { commands } from 'vscode';
import { logError } from '../log/log';

export const openWorkspaceSetting = async (settingId: string) => {
  // https://github.com/microsoft/vscode/issues/90086#issuecomment-803510704
  try {
    await commands.executeCommand('workbench.action.openSettings', settingId);
    await commands.executeCommand('workbench.action.openWorkspaceSettings');
  } catch (e) {
    logError('Failed to open workspace setting', e, settingId);
  }
};
