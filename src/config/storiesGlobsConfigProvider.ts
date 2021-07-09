import { getWorkspaceRoot } from '../util/getWorkspaceRoot';
import { SettingsConfigProvider } from './SettingsConfigProvider';

export const storiesGlobsConfigProvider = new SettingsConfigProvider(
  'storiesGlobs',
  (rawValue: unknown) => {
    const sanitize = () => {
      if (typeof rawValue === 'string') {
        return [rawValue];
      }

      if (Array.isArray(rawValue)) {
        return rawValue.filter(
          (item): item is string => typeof item === 'string',
        );
      }

      return undefined;
    };

    const storiesGlob = sanitize();
    return storiesGlob
      ? {
          value: {
            storiesGlobs: storiesGlob,
            storiesGlobsRoot: getWorkspaceRoot(),
          },
        }
      : undefined;
  },
);
