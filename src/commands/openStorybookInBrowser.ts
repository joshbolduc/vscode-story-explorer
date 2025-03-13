import { env, Uri, window } from 'vscode';
import { logError } from '../log/log';
import type { ServerManager } from '../server/ServerManager';

export const openStorybookInBrowser =
  (serverManager: ServerManager) => async () => {
    try {
      const { url } = await serverManager.ensureServerHealthy();
      if (!url) {
        return;
      }

      const uriToOpen = Uri.parse(url, true);
      await env.openExternal(uriToOpen);
    } catch (e) {
      logError('Failed to launch storybook in browser', e);

      return window.showErrorMessage('Failed to launch Storybook via browser.');
    }
  };
