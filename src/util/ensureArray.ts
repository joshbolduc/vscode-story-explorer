export const ensureArray = <T>(valueOrArray: T | T[]): T[] => {
  if (Array.isArray(valueOrArray)) {
    return valueOrArray;
  }

  return [valueOrArray];
};
