import type { Observable } from 'rxjs';
import {
  combineLatestWith,
  defer,
  distinctUntilChanged,
  EMPTY,
  from,
  ignoreElements,
  map,
  merge,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
  window,
} from 'rxjs';
import type { GlobPattern, Uri } from 'vscode';
import { RelativePattern, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import { storybookConfigDetectedContext } from '../constants/constants';
import { storybookConfigDirConfigSuffix } from '../constants/constants';
import { deferAndShare } from '../util/rxjs/deferAndShare';
import { distinctUntilNotStrictEqual } from '../util/rxjs/distinctUntilNotStrictEqual';
import { fromVsCodeSetting } from '../util/rxjs/fromVsCodeSetting';
import { watchFile } from '../util/rxjs/watchFile';
import { watchFileDeletion } from '../util/rxjs/watchFileDeletion';
import { setContext } from '../util/setContext';
import { workspaceRoot } from '../util/workspaceRoot';
import { configFileExtensions } from './configFileExtensions';
import type { ConfigLocation } from './configLocationCompareFn';
import { configLocationCompareFn } from './configLocationCompareFn';

export interface StorybookConfigLocation {
  dir: Uri;
  file: Uri;
}

const storybookConfigDirSetting = fromVsCodeSetting(
  storybookConfigDirConfigSuffix,
).pipe(
  map((value) => {
    if (typeof value !== 'string' || !value) {
      return undefined;
    }

    return value;
  }),
);

const configFileGlobDirPrefix = '**/.storybook';

const uriToConfigLocation = (uri: Uri): ConfigLocation => ({
  file: uri,
  dir: Utils.dirname(uri),
  relativePath: workspace.asRelativePath(uri, false),
});

/**
 * The location of the Storybook configuration file.
 */
export const storybookConfigLocation: Observable<
  StorybookConfigLocation | undefined
> = deferAndShare(() =>
  storybookConfigDirSetting.pipe(
    map((setting) => setting ?? configFileGlobDirPrefix),
    map(
      (baseLocation) =>
        `${baseLocation}/main.{${configFileExtensions.join(',')}}`,
    ),
    combineLatestWith(workspaceRoot),
    map(([fullGlob, root]): GlobPattern => {
      const rootPath = root?.fsPath;

      return rootPath ? new RelativePattern(rootPath, fullGlob) : fullGlob;
    }),
    distinctUntilChanged(),
    switchMap((globPattern) => {
      const watchObservable = watchFile(globPattern, {
        watchCreate: true,
      }).pipe(map(({ uri }) => uriToConfigLocation(uri)));

      const readObservable = defer(() =>
        from(workspace.findFiles(globPattern, '**/node_modules/**')).pipe(
          map((uris) =>
            uris.map(uriToConfigLocation).sort(configLocationCompareFn),
          ),
          map((uris) => uris[0]),
        ),
      );

      const deletionSubject = new Subject<Uri | undefined>();

      const mergedReadAndWatch = merge(
        deletionSubject.pipe(
          startWith(undefined),
          switchMap(() => readObservable),
        ),
        watchObservable,
      ).pipe(
        window(deletionSubject),
        switchMap((value) =>
          value.pipe(
            scan((oldValue, newValue) => {
              if (!newValue) {
                return oldValue;
              }

              if (!oldValue) {
                return newValue;
              }

              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- known length
              return [oldValue, newValue].sort(configLocationCompareFn)[0]!;
            }),
          ),
        ),
        distinctUntilNotStrictEqual(),
        shareReplay(1),
      );

      const deletionObservable = mergedReadAndWatch.pipe(
        switchMap((info) =>
          info?.file ? watchFileDeletion(info.file) : EMPTY,
        ),
        tap(({ uri }) => {
          deletionSubject.next(uri);
        }),
        ignoreElements(),
      );

      return merge(mergedReadAndWatch, deletionObservable);
    }),
    tap((e) => {
      setContext(storybookConfigDetectedContext, e?.file !== undefined);
    }),
    distinctUntilNotStrictEqual(),
  ),
);
