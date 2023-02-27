import { map } from 'rxjs';
import { gte } from 'semver';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { storybookVersion } from './storybookVersion';

export const fromMinimumVersion = (minVersion: string) =>
  deferAndShare(() =>
    storybookVersion.pipe(map((version) => gte(version, minVersion))),
  );
