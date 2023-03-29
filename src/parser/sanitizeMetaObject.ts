import { sanitize } from '@componentdriven/csf';
import type { PropertyInfo } from './PropertyInfo';

export const sanitizeMetaObject = (
  metaProperties: Record<string, PropertyInfo> = {},
) => {
  const { id, title, tags } = metaProperties;
  const titleAsString =
    typeof title?.value === 'string' ? title.value : undefined;
  const idAsString = typeof id?.value === 'string' ? id.value : undefined;

  const sanitizedId =
    idAsString !== undefined ? sanitize(idAsString) : undefined;

  const sanitizedTags = Array.isArray(tags?.value)
    ? tags?.value.filter((tag): tag is string => typeof tag === 'string')
    : undefined;

  return {
    id: sanitizedId,
    title: titleAsString,
    tags: sanitizedTags,
  };
};
