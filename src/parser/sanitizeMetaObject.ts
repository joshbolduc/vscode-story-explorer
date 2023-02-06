import { sanitize } from '@componentdriven/csf';

export const sanitizeMetaObject = (
  metaProperties: Record<string, unknown> = {},
) => {
  const { id, title, tags } = metaProperties;
  const titleAsString = typeof title === 'string' ? title : undefined;
  const idAsString = typeof id === 'string' ? id : undefined;

  const sanitizedId =
    idAsString !== undefined ? sanitize(idAsString) : undefined;

  const sanitizedTags = Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === 'string')
    : undefined;

  return {
    id: sanitizedId,
    title: titleAsString,
    tags: sanitizedTags,
  };
};
