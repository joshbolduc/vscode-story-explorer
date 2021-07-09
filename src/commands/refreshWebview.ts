import type { Uri } from 'vscode';
import { logWarn } from '../log/log';
import type { WebviewManager } from '../webview/WebviewManager';

export const refreshWebview =
  (webviewManager: WebviewManager) => (uri?: Uri) => {
    const storyId = webviewManager.getLastActiveStoryId();

    if (!storyId) {
      logWarn('Failed to refresh preview: no active story ID', uri);
      return;
    }

    webviewManager.refreshWebview(storyId);
  };
