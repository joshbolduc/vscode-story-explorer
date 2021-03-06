import { basename, dirname } from 'path';
import { scan } from 'picomatch';
import { FileType, Uri, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import type { StoriesConfigItem } from '../storybook/StorybookConfig';
import type { GlobSpecifier } from './GlobSpecifier';

const DEFAULT_FILES = '**/*.stories.@(mdx|tsx|ts|jsx|js)';
const DEFAULT_TITLE_PREFIX = '';

const isDirectory = async (path: string, root: Uri) => {
  try {
    const stat = await workspace.fs.stat(Utils.resolvePath(root, path));
    return !!(stat.type & FileType.Directory);
  } catch (e) {
    return false;
  }
};

const getSpecifier = async (item: StoriesConfigItem, root: Uri) => {
  if (typeof item === 'object') {
    return {
      directory: item.directory,
      titlePrefix: item.titlePrefix ?? DEFAULT_TITLE_PREFIX,
      files: item.files ?? DEFAULT_FILES,
    };
  }

  if (!item.includes('*')) {
    if (await isDirectory(item, root)) {
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
  configDir: Uri,
): Promise<GlobSpecifier> => {
  const { directory, ...specifier } = await getSpecifier(item, configDir);

  return {
    ...specifier,
    directory: Utils.resolvePath(configDir, directory),
  };
};
