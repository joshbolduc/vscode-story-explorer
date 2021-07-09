import type { ServerManager } from '../server/ServerManager';

export const stopStorybookServer = (serverManager: ServerManager) => () => {
  serverManager.stop();
};
