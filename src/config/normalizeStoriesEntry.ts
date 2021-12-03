import { basename, dirname, resolve } from 'path';
import { scan } from 'picomatch';
import { FileType, Uri, workspace } from 'vscode';
import type { StoriesConfigItem } from '../storybook/StorybookConfig';
import type { GlobSpecifier } from './GlobSpecifier';

const DEFAULT_FILES = '**/*.stories.@(mdx|tsx|ts|jsx|js)';
const DEFAULT_TITLE_PREFIX = '';

const isDirectory = async (path: string, rootPath: string) => {
  try {
    const stat = await workspace.fs.stat(Uri.file(resolve(rootPath, path)));
    return !!(stat.type & FileType.Directory);
  } catch (e) {
    return false;
  }
};

const getSpecifier = async (item: StoriesConfigItem, rootPath: string) => {
  if (typeof item === 'object') {
    return {
      directory: item.directory,
      titlePrefix: item.titlePrefix ?? DEFAULT_TITLE_PREFIX,
      files: item.files ?? DEFAULT_FILES,
    };
  }

  if (!item.includes('*')) {
    if (await isDirectory(item, rootPath)) {
      return {
        directory: item,
        titlePrefix: DEFAULT_TITLE_PREFIX,
        files: DEFAULT_FILES,
      };
    } else {
      return {
        directory: dirname(item),
        titlePrefix: DEFAULT_TITLE_PREFIX,
        files: basename(item),
      };
    }
  }

  const scanResult = scan(item);
  if (scanResult.isGlob) {
    return {
      directory: `${scanResult.prefix}${scanResult.base}`,
      titlePrefix: DEFAULT_TITLE_PREFIX,
      files: scanResult.glob,
    };
  }

  const directory = dirname(item);
  return {
    directory,
    titlePrefix: DEFAULT_TITLE_PREFIX,
    files: directory !== '.' ? item.slice(directory.length + 1) : item,
  };
};

export const interpretStoriesConfigItem = async (
  item: StoriesConfigItem,
  configDirPath: string,
): Promise<GlobSpecifier> => {
  const { directory, ...specifier } = await getSpecifier(item, configDirPath);

  return {
    ...specifier,
    directory: resolve(configDirPath, directory),
  };
};
