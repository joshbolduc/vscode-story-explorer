import type { WebviewManager } from '../webview/WebviewManager';

export const refreshAllWebviews = (webviewManager: WebviewManager) => () => {
  webviewManager.refreshAllWebviews();
};
