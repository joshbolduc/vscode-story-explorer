import { isValidStoriesConfigItem } from '../storybook/isValidStoriesConfigItem';
import { getWorkspaceRoot } from '../util/getWorkspaceRoot';
import { SettingsConfigProvider } from './SettingsConfigProvider';
import { interpretStoriesConfigItem } from './normalizeStoriesEntry';

export const storiesGlobsConfigProvider = new SettingsConfigProvider(
  'storiesGlobs',
  async (rawValue: unknown) => {
    const sanitize = () => {
      if (Array.isArray(rawValue)) {
        return rawValue.filter(isValidStoriesConfigItem);
      }

      if (isValidStoriesConfigItem(rawValue)) {
        return [rawValue];
      }

      return undefined;
    };

    const storiesConfigItems = sanitize();
    const configDir = getWorkspaceRoot();
    return storiesConfigItems && configDir
      ? {
          value: await Promise.all(
            storiesConfigItems.map((configItem) =>
              interpretStoriesConfigItem(configItem, configDir),
            ),
          ),
        }
      : undefined;
  },
);
