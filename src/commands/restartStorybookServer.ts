import { logError } from '../log/log';
import type { ServerManager } from '../server/ServerManager';

export const restartStorybookServer =
  (serverManager: ServerManager) => async () => {
    try {
      serverManager.stop();
      await serverManager.ensureServerHealthy();
    } catch (e) {
      logError('Failed to restart Storybook server', e);
    }
  };
