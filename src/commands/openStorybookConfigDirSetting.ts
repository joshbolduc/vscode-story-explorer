import { storybookConfigDirConfig } from '../constants/constants';
import { logError } from '../log/log';
import { openWorkspaceSetting } from '../util/openWorkspaceSetting';

export const openStorybookConfigDirSetting = () => async () => {
  try {
    await openWorkspaceSetting(storybookConfigDirConfig);
  } catch (e) {
    logError('Failed to open Storybook URL workspace setting', e);
  }
};
