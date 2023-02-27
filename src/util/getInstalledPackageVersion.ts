import { Uri } from 'vscode';
import { Utils } from 'vscode-uri';
import { findClosestPackageJson } from './findClosestPackageJson';
import { getParsedPackageJson } from './getParsedPackageJson';
import { hasProperty } from './guards/hasProperty';
import { isNonEmptyString } from './guards/isNonEmptyString';

const resolvePackageLocation = (packageName: string, resolveFromUri: Uri) => {
  try {
    return require.resolve(packageName, {
      paths: [resolveFromUri.fsPath],
    });
  } catch {
    return undefined;
  }
};

const getVersionFromPackageJson = (packageJsonParsed: unknown) => {
  if (!hasProperty('version')(packageJsonParsed)) {
    return undefined;
  }

  const { version } = packageJsonParsed;

  return isNonEmptyString(version) ? version : undefined;
};

export const getInstalledPackageVersion = async (
  packageName: string,
  resolveFromUri: Uri,
) => {
  const cliEntryPath = resolvePackageLocation(packageName, resolveFromUri);
  if (!cliEntryPath) {
    return undefined;
  }

  const packageJsonLocation = await findClosestPackageJson(
    Utils.dirname(Uri.file(cliEntryPath)),
  );
  if (!packageJsonLocation) {
    return undefined;
  }

  const packageJsonParsed = await getParsedPackageJson(packageJsonLocation);

  return getVersionFromPackageJson(packageJsonParsed);
};
