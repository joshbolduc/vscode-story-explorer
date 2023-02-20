import { platform } from 'process';
import { Uri, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import { logDebug } from '../log/log';
import type { ConfigurationSuffix } from '../types/ConfigurationSuffix';
import type { ValueOrPromise } from '../util/ValueOrPromise';
import { findAsync } from '../util/findAsync';
import { readConfiguration } from '../util/getConfiguration';
import { getUriAndParentUris } from '../util/getUriAndParentUris';
import { isNonEmptyString } from '../util/guards/isNonEmptyString';
import { pathDepthCompareFn } from '../util/pathDepthCompareFn';
import { strCompareFn } from '../util/strCompareFn';
import { tryStat } from '../util/tryStat';

const getSearchGlobSuffix = (cmdName: string) => {
  if (platform === 'win32') {
    return `${cmdName}.cmd`;
  }
  return `${cmdName}`;
};

const getSearchGlobParts = (cmdName: string) => [
  'node_modules',
  '.bin',
  getSearchGlobSuffix(cmdName),
];

type FilterFn = (binLocation: Uri) => ValueOrPromise<boolean>;

const getDetectedBinPathFromConfigDir = async (
  cmdName: string,
  configDir: Uri | undefined,
  filterFn: FilterFn | undefined,
): Promise<string | undefined> => {
  if (configDir) {
    logDebug(`Looking for ${cmdName} from config dir`, configDir);

    const workspaceFolder = workspace.getWorkspaceFolder(configDir);
    const parentDirs = getUriAndParentUris(configDir, workspaceFolder?.uri);

    for (const currentDir of parentDirs) {
      const proposedPath = Utils.joinPath(
        currentDir,
        ...getSearchGlobParts(cmdName),
      );
      if (await tryStat(proposedPath)) {
        logDebug(`Found ${cmdName} from config dir`, proposedPath);
        if (!filterFn || (await filterFn(proposedPath))) {
          return proposedPath.fsPath;
        }
      }
    }
  }

  return undefined;
};

const getDetectedBinPathFromWorkspaceSearch = async (
  cmdName: string,
  filterFn: FilterFn | undefined,
): Promise<string | undefined> => {
  const matches = await workspace.findFiles(
    `**/${getSearchGlobParts(cmdName).join('/')}`,
    null,
  );

  const sortedMatches = matches
    .map((uri) => ({
      uri,
      relativePath: workspace.asRelativePath(uri, false),
    }))
    .sort(
      (a, b) =>
        pathDepthCompareFn(a.relativePath, b.relativePath) ||
        strCompareFn(a.relativePath, b.relativePath),
    );

  const match = await findAsync(
    sortedMatches,
    async (result) => !filterFn || (await filterFn(result.uri)),
  );

  const fsPath = match?.uri.fsPath;

  if (fsPath) {
    logDebug(
      `Detected ${matches.length} match(es) for ${cmdName}, selecting ${fsPath}`,
    );
  } else {
    logDebug(`Detected ${matches.length} matches for ${cmdName}`);
  }

  return fsPath;
};

export const getDetectedBinPath = async (
  cmdName: string,
  configDir: Uri | undefined,
  filterFn?: FilterFn,
): Promise<string | undefined> => {
  return (
    (await getDetectedBinPathFromConfigDir(cmdName, configDir, filterFn)) ??
    (await getDetectedBinPathFromWorkspaceSearch(cmdName, filterFn))
  );
};

export const getBinPath = (
  configurationSuffix: ConfigurationSuffix,
  cmdName: string,
  configDir: Uri | undefined,
): ValueOrPromise<string | undefined> => {
  const configuredPath = readConfiguration(configurationSuffix);

  if (isNonEmptyString(configuredPath)) {
    return configuredPath;
  }

  return getDetectedBinPath(cmdName, configDir);
};
