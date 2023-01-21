export type PartialOrUndefined<T> = {
  [P in keyof T]?: T[P] | undefined;
};
