import type { ObservableInput } from 'rxjs';
import { defer, shareReplay } from 'rxjs';

export const deferAndShare = <R extends ObservableInput<unknown>>(
  observableFactory: () => R,
) => {
  return defer<R>(observableFactory).pipe(shareReplay(1));
};
