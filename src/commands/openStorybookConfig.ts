import { commands } from 'vscode';
import type { ConfigManager } from '../config/ConfigManager';
import { logError, logInfo } from '../log/log';
import { createOpenCommand } from '../util/createOpenCommand';

export const openStorybookConfig =
  (configManager: ConfigManager) => async () => {
    const configFile = configManager.getConfigFile();
    if (!configFile) {
      logInfo('Failed to open storybook config: config file not detected');
      return;
    }

    const openCommand = createOpenCommand({ arguments: [configFile] });

    try {
      await commands.executeCommand(
        openCommand.command,
        ...openCommand.arguments,
      );
    } catch (e) {
      logError('Failed to open storybook config', e);
    }
  };
