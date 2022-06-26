import type { GlobSpecifier } from '../config/GlobSpecifier';
import { getRelativePatternForWorkspace } from '../util/getRelativePatternForWorkspace';
import { convertGlob } from './convertGlob';

export const convertGlobForWorkspace = (globSpecifier: GlobSpecifier) => {
  const { globBase, globPattern, filter, regex } = convertGlob(globSpecifier);

  return {
    globPattern: getRelativePatternForWorkspace(globBase, globPattern),
    filter,
    regex,
  };
};
