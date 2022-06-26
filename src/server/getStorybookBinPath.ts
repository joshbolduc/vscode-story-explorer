import { workspace } from 'vscode';
import {
  configPrefix,
  serverInternalStorybookBinaryPathConfigSuffix,
} from '../constants/constants';
import { pathDepthCompareFn } from '../util/pathDepthCompareFn';
import { strCompareFn } from '../util/strCompareFn';

const getDetectedStorybookBinPath = async (): Promise<string | undefined> => {
  const matches = await workspace.findFiles(
    '**/node_modules/.bin/start-storybook',
    undefined,
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

  return match?.uri.fsPath;
};

export const getStorybookBinPath = ():
  | string
  | Promise<string | undefined>
  | undefined => {
  const configuredPath = workspace
    .getConfiguration(configPrefix)
    .get(serverInternalStorybookBinaryPathConfigSuffix);

  if (typeof configuredPath === 'string' && configuredPath) {
    return configuredPath;
  }

  return getDetectedStorybookBinPath();
};
