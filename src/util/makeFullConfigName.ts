import { configPrefix } from '../constants/constants';

export const makeFullConfigName = <T extends string>(suffix: T) =>
  `${configPrefix}.${suffix}` as const;
