import { readConfiguration } from '../util/getConfiguration';

export const getLaunchStrategy = () => {
  const launchStrategyRaw = readConfiguration('server.internal.launchStrategy');

  switch (launchStrategyRaw) {
    case 'npm':
    case 'task':
    case 'start-storybook':
    case 'storybook':
    case 'custom':
      return launchStrategyRaw;
    default:
      return 'detect';
  }
};

export type LaunchStrategy = ReturnType<typeof getLaunchStrategy>;
