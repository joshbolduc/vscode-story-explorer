import { platform } from 'process';
import { Uri, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import {
  configPrefix,
  serverInternalStorybookBinaryPathConfigSuffix,
} from '../constants/constants';
import { logDebug } from '../log/log';
import { pathDepthCompareFn } from '../util/pathDepthCompareFn';
import { strCompareFn } from '../util/strCompareFn';
import { tryStat } from '../util/tryStat';

const getSearchGlobSuffix = () => {
  if (platform === 'win32') {
    return 'start-storybook.cmd';
  }
  return 'start-storybook';
};

const getSearchGlobParts = () => [
  'node_modules',
  '.bin',
  getSearchGlobSuffix(),
];

const getDetectedStorybookBinPathFromConfigDir = async (
  configDir: Uri | undefined,
): Promise<string | undefined> => {
  if (configDir) {
    logDebug('Looking for start-storybook from config dir', configDir);

    const workspaceFolder = workspace.getWorkspaceFolder(configDir);
    let currentDir = configDir;

    do {
      const proposedPath = Utils.joinPath(currentDir, ...getSearchGlobParts());
      if (await tryStat(proposedPath)) {
        logDebug('Found start-storybook from config dir', proposedPath);
        return proposedPath.fsPath;
      }

      currentDir = Utils.dirname(currentDir);
    } while (
      workspaceFolder &&
      workspaceFolder.uri.toString() ===
        workspace.getWorkspaceFolder(currentDir)?.uri.toString()
    );
  }

  return undefined;
};

const getDetectedStorybookBinPathFromWorkspaceSearch = async (): Promise<
  string | undefined
> => {
  const matches = await workspace.findFiles(
    `**/${getSearchGlobParts().join('/')}`,
    null,
  );

  const [match] = matches
    .map((uri) => ({
      uri,
      relativePath: workspace.asRelativePath(uri, false),
    }))
    .sort(
      (a, b) =>
        pathDepthCompareFn(a.relativePath, b.relativePath) ||
        strCompareFn(a.relativePath, b.relativePath),
    );

  const fsPath = match?.uri.fsPath;

  if (fsPath) {
    logDebug(
      `Detected ${matches.length} match(es) for start-storybook, selecting ${fsPath}`,
    );
  } else {
    logDebug(`Detected ${matches.length} matches for start-storybook`);
  }

  return fsPath;
};

const getDetectedStorybookBinPath = async (
  configDir: Uri | undefined,
): Promise<string | undefined> => {
  return (
    (await getDetectedStorybookBinPathFromConfigDir(configDir)) ??
    (await getDetectedStorybookBinPathFromWorkspaceSearch())
  );
};

export const getStorybookBinPath = (
  configDir: Uri | undefined,
): string | Promise<string | undefined> | undefined => {
  const configuredPath = workspace
    .getConfiguration(configPrefix)
    .get(serverInternalStorybookBinaryPathConfigSuffix);

  if (typeof configuredPath === 'string' && configuredPath) {
    return configuredPath;
  }

  return getDetectedStorybookBinPath(configDir);
};
