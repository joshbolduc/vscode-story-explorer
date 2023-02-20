export const getSanitizedArgs = (rawArgs: unknown) => {
  if (
    Array.isArray(rawArgs) &&
    rawArgs.every(
      (item): item is string | number =>
        typeof item === 'string' || typeof item === 'number',
    )
  ) {
    return rawArgs.map((item) => item.toString());
  }

  return undefined;
};
