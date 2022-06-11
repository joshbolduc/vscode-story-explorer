import type { GlobSpecifier } from '../config/GlobSpecifier';

export const getPartialFilePath = (specifier: GlobSpecifier, uriPath: string) =>
  uriPath.slice(specifier.directory.length);
