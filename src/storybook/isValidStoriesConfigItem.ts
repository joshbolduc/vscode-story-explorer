import type { StoriesConfigItem, StoriesSpecifier } from './StorybookConfig';

export const isValidStoriesConfigItem = (
  item: unknown,
): item is StoriesConfigItem => {
  if (typeof item === 'string') {
    return true;
  }

  if (!item || typeof item !== 'object') {
    return false;
  }

  const itemAsPossibleSpecifier = item as Partial<StoriesSpecifier>;

  if (
    typeof itemAsPossibleSpecifier.directory === 'string' &&
    (itemAsPossibleSpecifier.files === undefined ||
      typeof itemAsPossibleSpecifier.files === 'string') &&
    (itemAsPossibleSpecifier.titlePrefix === undefined ||
      typeof itemAsPossibleSpecifier.titlePrefix === 'string')
  ) {
    return true;
  }

  return false;
};
