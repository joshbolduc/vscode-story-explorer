import { defer, ObservableInput, shareReplay } from 'rxjs';

export const deferAndShare = <R extends ObservableInput<unknown>>(
  observableFactory: () => R,
) => {
  return defer<R>(observableFactory).pipe(shareReplay(1));
};
