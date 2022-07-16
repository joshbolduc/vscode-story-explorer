import { poll } from '../util/poll';
import { getPort } from './getPort';

export const pollForPort = async (
  rootPid: number,
  interval = 2000,
): Promise<number> => {
  return poll(() => getPort(rootPid), interval);
};
