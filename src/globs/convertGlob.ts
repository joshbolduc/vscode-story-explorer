import { relative } from 'path';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { getGlobInfo } from './getGlobInfo';

interface ConvertedGlob {
  globPattern: string;
  globBasePath?: string;
  filter?: (path: string) => boolean;
  regex?: RegExp;
}

// FUTURE: it may be possible to convert a subset of globs (where `isGlob` is
// true) to a VS Code-compatible form that doesn't require post-filtering
export const convertGlob = (globSpecifier: GlobSpecifier): ConvertedGlob => {
  const globInfo = getGlobInfo(globSpecifier);

  if (!globInfo.isGlob) {
    return {
      globPattern: globInfo.basePath,
    };
  }

  const { basePath, regex } = globInfo;

  return {
    globBasePath: basePath,
    globPattern: '**/*',
    filter: (path) => {
      const relativePath = relative(basePath, path);
      return regex.test(relativePath);
    },
    regex,
  };
};
