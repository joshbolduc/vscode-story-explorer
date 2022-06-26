import { extname } from 'path';
import { configFileExtensions } from './configFileExtensions';

const getExtIndex = (name: string) => {
  const ext = extname(name);
  const index = configFileExtensions.indexOf(ext.slice(1));

  return index >= 0 ? index : undefined;
};

export const extensionCompareFn = (a: string, b: string) => {
  const aIndex = getExtIndex(a);
  const bIndex = getExtIndex(b);

  if (aIndex === undefined) {
    if (bIndex === undefined) {
      return 0;
    }

    return 1;
  }

  if (bIndex === undefined) {
    return -1;
  }

  return aIndex - bIndex;
};
