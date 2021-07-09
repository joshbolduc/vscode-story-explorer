import { poll } from '../util/poll';
import { getPort } from './getPort';

export const pollForPort = async (
  pid: number,
  interval = 2000,
): Promise<number> => {
  return poll(() => getPort(pid), interval);
};
