import { sanitize } from '@componentdriven/csf';

export const sanitizeMetaObject = (
  metaProperties: Record<string, unknown> = {},
) => {
  const { id, title } = metaProperties;
  const titleAsString = typeof title === 'string' ? title : undefined;
  const idAsString = typeof id === 'string' ? id : undefined;

  const sanitizedId =
    idAsString !== undefined ? sanitize(idAsString) : undefined;

  return {
    id: sanitizedId,
    title: titleAsString,
  };
};
