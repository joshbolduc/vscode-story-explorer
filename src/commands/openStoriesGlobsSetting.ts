import { storiesGlobsConfig } from '../constants/constants';
import { logError } from '../log/log';
import { openWorkspaceSetting } from '../util/openWorkspaceSetting';

export const openStoriesGlobsSetting = () => async () => {
  try {
    await openWorkspaceSetting(storiesGlobsConfig);
  } catch (e) {
    logError('Failed to open Storybook URL workspace setting', e);
  }
};
