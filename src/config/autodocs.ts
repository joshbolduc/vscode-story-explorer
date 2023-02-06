import { map, Observable, of, switchMap } from 'rxjs';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { distinctUntilNotStrictEqual } from '../util/rxjs/distinctUntilNotStrictEqual';
import { fromMinimumVersion } from '../versions/fromMinimumVersion';
import { VERSION_7_x_ALPHA } from '../versions/versions';
import { storybookConfig } from './storybookConfig';

export interface AutodocsConfig {
  autodocs: boolean | 'tag';
  defaultName: string;
}

export const autodocsConfig: Observable<AutodocsConfig | undefined> =
  deferAndShare(() =>
    fromMinimumVersion(VERSION_7_x_ALPHA).pipe(
      switchMap((enabled) => {
        if (!enabled) {
          return of(undefined);
        }

        return storybookConfig.pipe(
          map((value) => {
            if (!value?.config) {
              return undefined;
            }

            const { config } = value;

            const autodocs =
              typeof config.docs?.autodocs === 'boolean' ||
              config.docs?.autodocs === 'tag'
                ? config.docs.autodocs
                : 'tag';

            const defaultName = config.docs?.defaultName ?? 'Docs';

            return { autodocs, defaultName };
          }),
        );
      }),
      distinctUntilNotStrictEqual(),
    ),
  );
