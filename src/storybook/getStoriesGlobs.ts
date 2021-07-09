import type { StoriesConfig } from './StorybookConfig';

export const getStoriesGlobs = async (stories: StoriesConfig) => {
  const resolvedStories = await (typeof stories === 'function'
    ? stories()
    : stories);

  if (!Array.isArray(resolvedStories)) {
    return [];
  }

  return resolvedStories.filter((s) => typeof s === 'string');
};
