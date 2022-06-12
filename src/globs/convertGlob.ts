import { relative } from 'path';
import type { Uri } from 'vscode';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { getGlobInfo } from './getGlobInfo';

interface ConvertedGlobWithoutPattern {
  globBase: Uri;
  globPattern?: never;
  filter?: never;
  regex?: never;
}

interface ConvertedGlobWithPattern {
  globBase: Uri;
  globPattern: string;
  filter: (uri: Uri) => boolean;
  regex: RegExp;
}

export type ConvertedGlob =
  | ConvertedGlobWithoutPattern
  | ConvertedGlobWithPattern;

// FUTURE: it may be possible to convert a subset of globs (where `isGlob` is
// true) to a VS Code-compatible form that doesn't require post-filtering
export const convertGlob = (globSpecifier: GlobSpecifier): ConvertedGlob => {
  const globInfo = getGlobInfo(globSpecifier);

  if (!globInfo.isGlob) {
    return {
      globBase: globInfo.base,
    };
  }

  const { base, regex } = globInfo;

  return {
    globBase: base,
    globPattern: '**/*',
    filter: (uri) => {
      if (base.scheme !== uri.scheme || base.authority !== uri.authority) {
        return false;
      }

      const relativePath = relative(base.path, uri.path);
      return regex.test(relativePath);
    },
    regex,
  };
};
