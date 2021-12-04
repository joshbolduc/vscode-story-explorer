import { getLogger } from '../log/log';

export const openOutputChannel = () => () => {
  getLogger().show(false);
};
