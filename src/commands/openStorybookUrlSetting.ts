import { serverExternalUrlConfig } from '../constants/constants';
import { logError } from '../log/log';
import { openWorkspaceSetting } from '../util/openWorkspaceSetting';

export const openStorybookUrlSetting = () => async () => {
  try {
    await openWorkspaceSetting(serverExternalUrlConfig);
  } catch (e) {
    logError('Failed to open Storybook URL workspace setting', e);
  }
};
