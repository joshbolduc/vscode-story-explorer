import { map } from 'rxjs';
import { lt } from 'semver';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { storybookVersion } from './storybookVersion';

export const fromPriorVersion = (minVersion: string) =>
  deferAndShare(() =>
    storybookVersion.pipe(map((version) => lt(version, minVersion))),
  );
