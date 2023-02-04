type Falsy = false | 0 | -0 | 0n | '' | null | undefined;

export const isTruthy = <T>(t: T | Falsy): t is Exclude<T, Falsy> => !!t;
