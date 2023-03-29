import type { PropertyInfo } from '../PropertyInfo';

export const assignProperties = (
  target: Record<string, PropertyInfo>,
  properties: object,
) => {
  Object.entries(properties).forEach(
    ([key, value]: [key: string, value: unknown]) => {
      target[key] = { value, isPartOfDeclaration: true };
    },
  );
};
