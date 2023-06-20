import type { Observable } from 'rxjs';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { isNonEmptyString } from '../util/guards/isNonEmptyString';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { distinctUntilNotStrictEqual } from '../util/rxjs/distinctUntilNotStrictEqual';
import { fromVsCodeSetting } from '../util/rxjs/fromVsCodeSetting';
import { fromMinimumVersion } from '../versions/fromMinimumVersion';
import { VERSION_7_x_ALPHA } from '../versions/versions';
import { storybookConfig } from './storybookConfig';

export interface AutodocsConfig {
  autodocs: boolean | 'tag';
  defaultName: string;
}

const defaultAutodocsConfig = {
  autodocs: 'tag',
  defaultName: 'Docs',
} as const satisfies AutodocsConfig;

const isValidAutodocsValue = (
  value: unknown,
): value is AutodocsConfig['autodocs'] =>
  value === 'tag' || typeof value === 'boolean';

const autodocsSetting = fromVsCodeSetting('storybookConfig.docs.autodocs').pipe(
  switchMap((value) => {
    if (isValidAutodocsValue(value)) {
      return of(value);
    }

    return storybookConfig.pipe(
      map((configValue) => {
        if (configValue?.config) {
          const { config } = configValue;

          const providedValue = config.docs?.autodocs;
          if (isValidAutodocsValue(providedValue)) {
            return providedValue;
          }
        }

        return defaultAutodocsConfig.autodocs;
      }),
    );
  }),
);

const defaultNameSetting = fromVsCodeSetting(
  'storybookConfig.docs.defaultName',
).pipe(
  switchMap((value) => {
    if (isNonEmptyString(value)) {
      return of(value);
    }

    return storybookConfig.pipe(
      map((configValue) => {
        if (configValue?.config) {
          const { config } = configValue;

          const providedValue = config.docs?.defaultName;
          if (isNonEmptyString(providedValue)) {
            return providedValue;
          }
        }

        return defaultAutodocsConfig.defaultName;
      }),
    );
  }),
);

export const autodocsConfig: Observable<AutodocsConfig | undefined> =
  deferAndShare(() =>
    fromMinimumVersion(VERSION_7_x_ALPHA).pipe(
      switchMap((enabled) => {
        if (!enabled) {
          return of(undefined);
        }

        return combineLatest([autodocsSetting, defaultNameSetting]).pipe(
          map(([autodocs, defaultName]) => ({ autodocs, defaultName })),
        );
      }),
      distinctUntilNotStrictEqual(),
    ),
  );
