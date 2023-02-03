import { firstValueFrom } from 'rxjs';
import { commands } from 'vscode';
import { storybookConfigLocation } from '../config/storybookConfigLocation';
import { logError, logInfo } from '../log/log';
import { createOpenCommand } from '../util/createOpenCommand';

export const openStorybookConfig = () => async () => {
  const configFile = (
    await firstValueFrom(storybookConfigLocation, { defaultValue: undefined })
  )?.file;
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
