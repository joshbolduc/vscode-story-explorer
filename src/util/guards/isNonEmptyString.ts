export const isNonEmptyString = (input: unknown): input is string =>
  !!input && typeof input === 'string';
