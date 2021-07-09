import { strCompareFn } from './strCompareFn';

const getDepth = (path: string) => path.split('/').length;

export const pathDepthCompareFn = (a: string, b: string): number => {
  const aDepth = getDepth(a);
  const bDepth = getDepth(b);

  if (aDepth !== bDepth) {
    return aDepth - bDepth;
  }

  return strCompareFn(a, b);
};
