import type { IncludeExcludeOptions } from '@componentdriven/csf';

export const isStoryDescriptor = (
  value: unknown,
): value is NonNullable<IncludeExcludeOptions['excludeStories']> => {
  return (
    value instanceof RegExp ||
    (Array.isArray(value) && value.every((v) => typeof v === 'string'))
  );
};
