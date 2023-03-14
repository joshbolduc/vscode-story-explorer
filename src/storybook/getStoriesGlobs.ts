import { isValidStoriesConfigItem } from './isValidStoriesConfigItem';

export const getStoriesGlobs = async (stories: unknown) => {
  const resolvedStories = await (typeof stories === 'function'
    ? (stories as () => unknown)()
    : stories);

  if (!Array.isArray(resolvedStories)) {
    return [];
  }

  return (resolvedStories as unknown[]).filter(isValidStoriesConfigItem);
};
