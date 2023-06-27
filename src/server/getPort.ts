import { exec } from 'child_process';
import { platform } from 'process';
import netstat from 'node-netstat';
import pidtree from 'pidtree';
import { logWarn } from '../log/log';
import { parseLsOfForPorts } from './parseLsOfForPorts';

const getPortNetstat = (pids: number[]) =>
  new Promise<number | undefined>((resolve, reject) => {
    netstat(
      {
        done: (error) => {
          if (error) {
            logWarn('Got error running netstat', error);
            reject(new Error(error));
            return;
          }

          resolve(undefined);
        },
      },
      (data) => {
        if (data.local.port && pids.includes(data.pid) && data.local.address == '127.0.0.1') {
          resolve(data.local.port);
        }
      },
    );
  });

const getPortLsOf = (pids: number[]) =>
  new Promise<number | undefined>((resolve, reject) => {
    exec(`lsof -aPni -Fn -p ${pids.map(Number).join(',')}`, (error, stdout) => {
      if (error) {
        if (error.code === 1) {
          resolve(undefined);
          return;
        }

        logWarn('Got error running lsof', error);
        reject(error);
        return;
      }

      const [port] = parseLsOfForPorts(stdout);

      resolve(port);
    });
  });

export const getPort = async (rootPid: number) => {
  const childPids = await pidtree(rootPid);
  const allPids = [rootPid, ...childPids];

  if (platform === 'win32') {
    return getPortNetstat(allPids);
  }

  return getPortLsOf(allPids);
};
