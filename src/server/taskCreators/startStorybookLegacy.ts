import {
  serverInternalCommandLineArgsConfigSuffix,
  serverInternalStorybookBinaryPathConfigSuffix,
} from '../../constants/constants';
import { readConfiguration } from '../../util/getConfiguration';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import type { LaunchStrategy } from '../launchStrategy';
import { makeStartStorybookTaskCreator } from './startStorybook';

const hasStartStorybookConfig = () =>
  !!(
    readConfiguration('server.internal.startStorybook.path') ||
    readConfiguration('server.internal.startStorybook.args') ||
    readConfiguration('server.internal.launchStrategy') ===
      ('start-storybook' satisfies LaunchStrategy)
  );

const hasLegacyConfig = () =>
  !!(
    readConfiguration(serverInternalStorybookBinaryPathConfigSuffix) ||
    readConfiguration(serverInternalCommandLineArgsConfigSuffix)
  );

export const tryGetStartStorybookLegacyTask = async (
  options: TaskCreatorOptions,
) => {
  // No-op if there is no legacy configuration, or if the newer launch
  // strategy-based configuration is present. Otherwise, try to honor the
  // specified settings to preserve compatibility.
  if (!hasLegacyConfig() || hasStartStorybookConfig()) {
    return undefined;
  }

  return makeStartStorybookTaskCreator(
    serverInternalStorybookBinaryPathConfigSuffix,
    serverInternalCommandLineArgsConfigSuffix,
  )(options);
};
