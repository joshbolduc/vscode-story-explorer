export const findAsync = async <T>(
  arr: readonly T[],
  predicate: (value: T, index: number, obj: readonly T[]) => Promise<boolean>,
) => {
  for (let i = 0; i < arr.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (await predicate(arr[i]!, i, arr)) {
      return arr[i];
    }
  }
};
