import { env, Uri, window } from 'vscode';
import { logError } from '../log/log';
import type { ServerManager } from '../server/ServerManager';

export const openStorybookInBrowser =
  (serverManager: ServerManager) => async () => {
    try {
      const host = await serverManager.ensureServerHealthy();
      if (!host) {
        return;
      }

      const uriToOpen = Uri.parse(host, true);
      await env.openExternal(uriToOpen);
    } catch (e) {
      logError('Failed to launch storybook in browser', e);

      return window.showErrorMessage('Failed to launch Storybook via browser.');
    }
  };
