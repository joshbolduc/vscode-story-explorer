import { basename, dirname } from 'path';
import { scan } from 'picomatch';
import type { Uri } from 'vscode';
import { FileType, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import type { StoriesConfigItem } from '../storybook/StorybookConfig';
import type { GlobSpecifier } from './GlobSpecifier';

const DEFAULT_FILES_WITH_MDX_STORIES_ONLY = '**/*.stories.@(mdx|tsx|ts|jsx|js)';
const DEFAULT_FILES_WITH_ALL_MDX_FILES = '**/*.@(mdx|stories.@(tsx|ts|jsx|js))';
const DEFAULT_TITLE_PREFIX = '';

const isDirectory = async (path: string, root: Uri) => {
  try {
    const stat = await workspace.fs.stat(Utils.resolvePath(root, path));
    return !!(stat.type & FileType.Directory);
  } catch (e) {
    return false;
  }
};

interface GlobSpecifierOptions {
  defaultGlobsIncludesAllMdx: boolean;
}

const getSpecifier = async (
  item: StoriesConfigItem,
  root: Uri,
  { defaultGlobsIncludesAllMdx }: GlobSpecifierOptions,
) => {
  const defaultFilesGlob = defaultGlobsIncludesAllMdx
    ? DEFAULT_FILES_WITH_ALL_MDX_FILES
    : DEFAULT_FILES_WITH_MDX_STORIES_ONLY;

  if (typeof item === 'object') {
    return {
      directory: item.directory,
      titlePrefix: item.titlePrefix ?? DEFAULT_TITLE_PREFIX,
      files: item.files ?? defaultFilesGlob,
    };
  }

  if (!item.includes('*')) {
    if (await isDirectory(item, root)) {
      return {
        directory: item,
        titlePrefix: DEFAULT_TITLE_PREFIX,
        files: defaultFilesGlob,
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
  options: GlobSpecifierOptions,
): Promise<GlobSpecifier> => {
  const { directory, ...specifier } = await getSpecifier(
    item,
    configDir,
    options,
  );

  return {
    ...specifier,
    directory: Utils.resolvePath(configDir, directory),
  };
};
