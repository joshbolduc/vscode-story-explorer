import { exec } from 'child_process';
import { platform } from 'process';
import netstat from 'node-netstat';
import { logWarn } from '../log/log';

const getPortNetstat = (pid: number) =>
  new Promise<number | undefined>((resolve, reject) => {
    netstat(
      {
        filter: { pid },
        done: (error) => {
          if (error) {
            logWarn('Got error running netstat', error);
            reject(new Error(error));
          }
        },
      },
      (data) => {
        resolve(data.local.port ?? undefined);
      },
    );
  });

const getPortLsOf = (pid: number) =>
  new Promise<number | undefined>((resolve, reject) => {
    exec(`lsof -aPi -Fn -p ${Number(pid)}`, (error, stdout) => {
      if (error) {
        if (error.code === 1) {
          resolve(undefined);
          return;
        }

        logWarn('Got error running lsof', error);
        reject(error);
        return;
      }

      const lines = stdout.trim().split('\n');
      const addressLine = lines.find((line) => line.startsWith('n'));
      const matches = addressLine ? /:([0-9]+)$/.exec(addressLine) : undefined;
      const [, port] = matches ?? [];

      resolve(port === undefined ? undefined : parseInt(port, 10));
    });
  });

export const getPort = (pid: number) => {
  if (platform === 'win32') {
    return getPortNetstat(pid);
  }

  return getPortLsOf(pid);
};
