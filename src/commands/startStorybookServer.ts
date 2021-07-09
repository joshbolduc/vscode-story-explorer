import { logError } from '../log/log';
import type { ServerManager } from '../server/ServerManager';

export const startStorybookServer =
  (serverManager: ServerManager) => async () => {
    try {
      await serverManager.ensureServerHealthy();
    } catch (e) {
      logError('Failed to start Storybook server', e);
    }
  };
