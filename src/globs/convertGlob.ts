import { relative } from 'path';
import { getGlobInfo } from './getGlobInfo';

interface ConvertedGlob {
  globBasePath: string;
  globPattern: string;
  filter?: (path: string) => boolean;
  regex?: RegExp;
}

// FUTURE: it may be possible to convert a subset of globs (where `isGlob` is
// true) to a VS Code-compatible form that doesn't require post-filtering
export const convertGlob = (
  glob: string,
  globBasePath: string,
): ConvertedGlob => {
  const globInfo = getGlobInfo(glob, globBasePath);

  if (!globInfo.isGlob) {
    return {
      globBasePath,
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
