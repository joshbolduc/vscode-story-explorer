import { commands } from 'vscode';
import { logWarn } from '../log/log';

export const setContext = <T>(key: string, value: unknown) => {
  commands.executeCommand<T>('setContext', key, value).then(undefined, (e) => {
    logWarn('Failed to set context', e, key, value);
  });
};
