import { resolve } from 'path';
import { makeRe, scan } from 'picomatch';

export const getGlobInfo = (glob: string, globBasePath: string) => {
  const globOptions = {
    fastpaths: false,
    noglobstar: false,
    bash: false,
  };

  const scanInfo = scan(glob, { ...globOptions, tokens: true });

  if (scanInfo.isGlob) {
    const basePath = resolve(globBasePath, scanInfo.base);
    const regex = makeRe(scanInfo.glob, globOptions);

    return { basePath, regex, isGlob: true as const };
  } else {
    return { basePath: scanInfo.base, isGlob: false as const };
  }
};
