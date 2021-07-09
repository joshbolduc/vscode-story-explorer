import { sleep } from './sleep';

interface PollFn {
  <T>(fn: () => Promise<T | undefined>, intervalMs?: number): Promise<T>;
  <T>(
    fn: () => Promise<T>,
    intervalMs?: number,
    shouldPollAgain?: (result: T) => boolean,
  ): Promise<T>;
  <T, U>(
    fn: () => Promise<T | U>,
    intervalMs?: number,
    shouldPollAgain?: (result: T | U) => result is U,
  ): Promise<T>;
}

// @ts-expect-error -- these generics are complicated, but should be compatible
export const poll: PollFn = <T, U>(
  fn: () => Promise<T | U>,
  intervalMs = 2000,
  shouldPollAgain = (result: T | U): result is U => result === undefined,
): Promise<T> => {
  return fn().then((result) => {
    if (shouldPollAgain(result)) {
      return sleep(intervalMs).then(() =>
        poll<T, U>(fn, intervalMs, shouldPollAgain),
      );
    }

    return result;
  });
};
