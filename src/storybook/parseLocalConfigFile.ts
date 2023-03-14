import { ChildProcess, fork, SendHandle } from 'child_process';
import { resolve } from 'path';
import {
  defer,
  firstValueFrom,
  fromEvent,
  map,
  Observable,
  switchMap,
  takeUntil,
  timeout,
} from 'rxjs';
import { logWarn } from '../log/log';
import type { StorybookConfig } from './StorybookConfig';

const configParse = (configFilePath: string) => {
  const modulePath = resolve(__dirname, '../configParser/index.js');

  return defer(() =>
    new Observable<ChildProcess>((subscriber) => {
      const abortController = new AbortController();

      const childProcess = fork(modulePath, [configFilePath], {
        // This is necessary to not inherit args that we don't want (e.g., for
        // extension debugging) from the host;
        // https://github.com/microsoft/vscode/issues/27665#issuecomment-305444891
        execArgv: [],
        signal: abortController.signal,
      });

      subscriber.next(childProcess);

      return () => {
        abortController.abort();
      };
    }).pipe(
      switchMap((childProcess) => {
        return (
          fromEvent(childProcess, 'message') as Observable<
            [message: StorybookConfig, sendHandle: SendHandle]
          >
        ).pipe(
          map(([message]) => message),
          takeUntil(fromEvent(childProcess, 'close')),
          timeout({ first: 10000 }),
        );
      }),
    ),
  );
};

export const parseLocalConfigFile = async (configFilePath: string) => {
  try {
    return await firstValueFrom(configParse(configFilePath));
  } catch (e) {
    logWarn('Failed to read config file', e, configFilePath);
  }

  return undefined;
};
