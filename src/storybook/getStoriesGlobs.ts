import type { StoriesConfig } from './StorybookConfig';
import { isValidStoriesConfigItem } from './isValidStoriesConfigItem';

export const getStoriesGlobs = async (stories: StoriesConfig) => {
  const resolvedStories = await (typeof stories === 'function'
    ? stories()
    : stories);

  if (!Array.isArray(resolvedStories)) {
    return [];
  }

  return resolvedStories.filter(isValidStoriesConfigItem);
};
