export const hasProperty =
  <T extends string>(propertyName: T) =>
  (v: unknown): v is Record<T, unknown> =>
    !!(v && typeof v === 'object' && propertyName in v);
