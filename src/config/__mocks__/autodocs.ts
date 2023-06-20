import { BehaviorSubject, defer } from 'rxjs';
import type {
  AutodocsConfig,
  autodocsConfig as autodocsConfigActual,
} from '../autodocs';

export const mockAutodocsSubject = new BehaviorSubject<
  AutodocsConfig | undefined
>(undefined);

export const autodocsConfig: typeof autodocsConfigActual = defer(
  () => mockAutodocsSubject,
);
