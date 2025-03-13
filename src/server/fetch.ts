import type { IncomingMessage } from 'http';
import { request } from 'http';
import type { CancellationToken, Disposable } from 'vscode';
import { CancellationError } from 'vscode';

export class TimeoutError extends Error {}

export const fetch = (
  url: string,
  {
    token,
    timeout,
  }: {
    token?: CancellationToken;
    timeout?: number;
  },
) => {
  return new Promise<IncomingMessage>((resolve, reject) => {
    const cleanup = () => {
      tokenListener?.dispose();
      tokenListener = undefined;
      if (!req.destroyed) {
        req.destroy();
      }
    };

    const req = request(url, { timeout })
      .once('response', (res) => {
        cleanup();
        resolve(res);
      })
      .once('timeout', () => {
        cleanup();
        reject(new TimeoutError());
      })
      .once('error', (e) => {
        cleanup();
        reject(e);
      })
      .once('close', () => {
        cleanup();
        reject(new Error('Connection closed prematurely'));
      });

    req.end();

    let tokenListener: Disposable | undefined = token?.onCancellationRequested(
      () => {
        cleanup();
        reject(new CancellationError());
      },
    );
  });
};
