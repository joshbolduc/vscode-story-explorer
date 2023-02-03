import { isDeepStrictEqual } from 'util';
import { distinctUntilChanged } from 'rxjs';

export const distinctUntilNotStrictEqual = <T>() =>
  distinctUntilChanged<T>((prev, cur) => isDeepStrictEqual(prev, cur));
