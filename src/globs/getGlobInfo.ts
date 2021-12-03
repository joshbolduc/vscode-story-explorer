import { resolve } from 'path';
import { makeRe, scan } from 'picomatch';
import type { GlobSpecifier } from '../config/GlobSpecifier';

export const getGlobInfo = ({ directory, files }: GlobSpecifier) => {
  const glob = `${directory}/${files}`;

  const globOptions = {
    fastpaths: false,
    noglobstar: false,
    bash: false,
  };

  const scanInfo = scan(glob, { ...globOptions, tokens: true });

  if (scanInfo.isGlob) {
    const basePath = resolve(directory, scanInfo.base);
    const regex = makeRe(scanInfo.glob, globOptions);

    return { basePath, regex, isGlob: true as const };
  } else {
    return { basePath: scanInfo.base, isGlob: false as const };
  }
};
