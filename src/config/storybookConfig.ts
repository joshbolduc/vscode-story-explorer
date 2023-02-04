import { map, of, startWith, switchMap, tap } from 'rxjs';
import type { Uri } from 'vscode';
import {
  storybookConfigParsedContext,
  storybookConfigParseFailedContext,
} from '../constants/constants';
import { parseLocalConfigFile } from '../storybook/parseLocalConfigFile';
import { isVirtualUri } from '../util/guards/isVirtualUri';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { distinctUntilNotStrictEqual } from '../util/rxjs/distinctUntilNotStrictEqual';
import { watchFile } from '../util/rxjs/watchFile';
import { setContext } from '../util/setContext';
import { storybookConfigLocation } from './storybookConfigLocation';

const setParseFailedConfigContext = (failed: boolean) => {
  setContext(storybookConfigParseFailedContext, failed);
};

const setParsedConfigContext = (parsed: boolean) => {
  setContext(storybookConfigParsedContext, parsed);
};

const parseConfigUri = (uri: Uri) =>
  isVirtualUri(uri) ? undefined : parseLocalConfigFile(uri.fsPath);

/**
 * A parsed Storybook configuration.
 */
export const storybookConfig = deferAndShare(() =>
  storybookConfigLocation.pipe(
    switchMap((location) => {
      if (!location) {
        return of(undefined);
      }

      return watchFile(location.file, { watchChange: true }).pipe(
        startWith({ uri: location.file }),
        map(({ uri }) => ({ uri, config: parseConfigUri(uri) })),
      );
    }),
    tap((result) => {
      const parsed = !!result?.config;
      setParsedConfigContext(parsed);
      setParseFailedConfigContext(!parsed);
    }),
    distinctUntilNotStrictEqual(),
  ),
);
