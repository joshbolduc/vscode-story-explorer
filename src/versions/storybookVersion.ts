import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { valid } from 'semver';
import {
  buildDepTree,
  getYarnLockfileType,
  LockfileType,
} from 'snyk-nodejs-lockfile-parser';
import type { Uri } from 'vscode';
import { Utils } from 'vscode-uri';
import { storybookConfigLocation } from '../config/storybookConfigLocation';
import { logDebug } from '../log/log';
import { findClosestFile } from '../util/findClosestFile';
import { findClosestPackageJson } from '../util/findClosestPackageJson';
import { getFileContentFromFs } from '../util/getFileContent';
import { getInstalledPackageVersion } from '../util/getInstalledPackageVersion';
import { getParsedPackageJson } from '../util/getParsedPackageJson';
import { hasProperty } from '../util/guards/hasProperty';
import { isNonEmptyString } from '../util/guards/isNonEmptyString';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { fromVsCodeSetting } from '../util/rxjs/fromVsCodeSetting';
import { tryStat } from '../util/tryStat';
import { getEffectiveStorybookVersion } from './getEffectiveStorybookVersion';
import { notableVersions } from './versions';

const DEFAULT_VERSION = notableVersions[0];

const STORYBOOK_PACKAGES = ['@storybook/cli', 'storybook'] as const;

const storybookVersionSetting = fromVsCodeSetting('storybookVersion').pipe(
  map(
    (rawValue) =>
      (typeof rawValue === 'string' ? valid(rawValue) : undefined) ?? undefined,
  ),
);

const inferLockfileType = async (
  lockfileContent: string,
  lockfileLocation: Uri,
): Promise<LockfileType> => {
  if (Utils.basename(lockfileLocation) === 'yarn.lock') {
    // This check is partially based on what `getYarnLockfileType` does, but
    // uses VS Code's fs API instead of node's
    if (
      await tryStat(
        Utils.joinPath(Utils.dirname(lockfileLocation), '.yarnrc.yml'),
      )
    ) {
      return LockfileType.yarn2;
    }

    return getYarnLockfileType(lockfileContent);
  }

  return LockfileType.npm;
};

const storybookCliInstalledVersion = deferAndShare(() => {
  return storybookConfigLocation.pipe(
    switchMap(async (location) => {
      if (!location) {
        return undefined;
      }

      for (const packageName of STORYBOOK_PACKAGES) {
        const version = await getInstalledPackageVersion(
          packageName,
          location.dir,
        );

        if (version && valid(version)) {
          logDebug(`Detected ${packageName} ${version} installed`);
          return version;
        }
      }
    }),
  );
});

const findLockfileLocation = (dir: Uri) => {
  const lockfileNames = ['yarn.lock', 'package-lock.json'] as const;

  return findClosestFile(lockfileNames, dir);
};

const storybookCliLockfileVersion = deferAndShare(() => {
  return storybookConfigLocation.pipe(
    switchMap(async (location) => {
      if (!location) {
        return undefined;
      }

      const packageJsonLocation = await findClosestPackageJson(location.dir);
      if (!packageJsonLocation) {
        return undefined;
      }
      const packageJsonContent = await getFileContentFromFs(
        packageJsonLocation,
      );

      const lockfileLocation = await findLockfileLocation(location.dir);
      if (!lockfileLocation) {
        return undefined;
      }
      const lockfileContent = await getFileContentFromFs(lockfileLocation);

      const tree = await buildDepTree(
        packageJsonContent,
        lockfileContent,
        true,
        await inferLockfileType(lockfileContent, lockfileLocation),
        false,
      );

      for (const packageName of STORYBOOK_PACKAGES) {
        const depEntry = tree.dependencies[packageName];

        if (depEntry && !depEntry.labels?.missingLockFileEntry) {
          const { version } = depEntry;

          if (version && valid(version)) {
            logDebug(
              `Detected ${packageName} ${version} specified in lockfile`,
            );
            return version;
          }
        }
      }

      return undefined;
    }),
  );
});

const getStorybookDependencyRange = (parsedPackageJson: unknown) => {
  const dependencyFields = ['devDependencies', 'dependencies'] as const;
  for (const dependencyField of dependencyFields) {
    if (hasProperty(dependencyField)(parsedPackageJson)) {
      const dependencies = parsedPackageJson[dependencyField];
      for (const packageName of STORYBOOK_PACKAGES) {
        if (hasProperty(packageName)(dependencies)) {
          const version = dependencies[packageName];
          if (isNonEmptyString(version)) {
            logDebug(`Inferred ${packageName} ${version} via package.json`);
            return version;
          }
        }
      }
    }
  }
};

const storybookCliPackageJsonVersion = deferAndShare(() => {
  return storybookConfigLocation.pipe(
    switchMap(async (location) => {
      if (!location) {
        return undefined;
      }

      const packageJsonLocation = await findClosestPackageJson(location.dir);
      if (!packageJsonLocation) {
        return undefined;
      }

      const parsedPackageJson = await getParsedPackageJson(packageJsonLocation);
      const versionOrRange = getStorybookDependencyRange(parsedPackageJson);

      if (!versionOrRange) {
        return undefined;
      }

      return getEffectiveStorybookVersion(versionOrRange);
    }),
  );
});

export const storybookVersion = deferAndShare(() =>
  storybookVersionSetting.pipe(
    switchMap((value) => (value ? of(value) : storybookCliInstalledVersion)),
    switchMap((value) => (value ? of(value) : storybookCliLockfileVersion)),
    switchMap((value) => (value ? of(value) : storybookCliPackageJsonVersion)),
    map((value) => value ?? DEFAULT_VERSION),
    distinctUntilChanged(),
  ),
);
