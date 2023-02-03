import type { Event } from 'vscode';
import { fromEventPatternTyped } from './fromEventPatternTyped';

export const fromVsCodeEvent = <T>(event: Event<T>) =>
  fromEventPatternTyped(event, (_, disposable) => {
    disposable.dispose();
  });
