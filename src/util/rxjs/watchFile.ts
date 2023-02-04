import { map, merge, Observable, switchMap } from 'rxjs';
import { FileSystemWatcher, GlobPattern, Uri, workspace } from 'vscode';
import { isTruthy } from '../guards/isTruthy';
import { fromVsCodeEvent } from './fromVsCodeEvent';

export const watchFile = (
  patternOrUri: GlobPattern | Uri,
  {
    watchCreate = false,
    watchChange = false,
    watchDelete = false,
  }: {
    watchCreate?: boolean;
    watchChange?: boolean;
    watchDelete?: boolean;
  },
) => {
  return new Observable<FileSystemWatcher>((subscriber) => {
    const glob =
      typeof patternOrUri === 'string' || 'pattern' in patternOrUri
        ? patternOrUri
        : patternOrUri.fsPath;

    const watcher = workspace.createFileSystemWatcher(
      glob,
      !watchCreate,
      !watchChange,
      !watchDelete,
    );
    subscriber.next(watcher);

    return () => {
      watcher.dispose();
    };
  }).pipe(
    switchMap((watcher) =>
      merge(
        ...[
          watchChange &&
            fromVsCodeEvent(watcher.onDidChange).pipe(
              map((uri) => ({ uri, type: 'change' as const })),
            ),
          watchCreate &&
            fromVsCodeEvent(watcher.onDidCreate).pipe(
              map((uri) => ({ uri, type: 'create' as const })),
            ),
          watchDelete &&
            fromVsCodeEvent(watcher.onDidDelete).pipe(
              map((uri) => ({ uri, type: 'delete' as const })),
            ),
        ].filter(isTruthy),
      ),
    ),
  );
};
