import { makeRe, scan } from 'picomatch';
import { Utils } from 'vscode-uri';
import type { GlobSpecifier } from '../config/GlobSpecifier';

export const getGlobInfo = ({ directory, files }: GlobSpecifier) => {
  const glob = `${directory.path}/${files}`;

  const globOptions = {
    fastpaths: false,
    noglobstar: false,
    bash: false,
  };

  const scanInfo = scan(glob, { ...globOptions, tokens: true });

  if (scanInfo.isGlob) {
    const base = Utils.resolvePath(directory, scanInfo.base);
    const regex = makeRe(scanInfo.glob, globOptions);

    return { base, regex, isGlob: true as const };
  }

  return {
    base: directory.with({ path: scanInfo.base }),
    isGlob: false as const,
  };
};
