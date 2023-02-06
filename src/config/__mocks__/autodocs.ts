import { BehaviorSubject, defer } from 'rxjs';
import type { AutodocsConfig } from '../autodocs';

export const mockAutodocsSubject = new BehaviorSubject<
  AutodocsConfig | undefined
>(undefined);

export const autodocsConfig: typeof import('../autodocs').autodocsConfig =
  defer(() => mockAutodocsSubject);
