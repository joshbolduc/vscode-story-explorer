import { fromEventPattern, Observable } from 'rxjs';

interface FromEventPattern {
  <T, TToken>(
    addHandler: (handler: (e: T) => void) => TToken,
    removeHandler?: (handler: (e: T) => void, signal: TToken) => void,
    resultSelector?: (...args: unknown[]) => T,
  ): Observable<T>;
}
export const fromEventPatternTyped: FromEventPattern = fromEventPattern;
