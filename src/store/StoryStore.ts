import pLimit from 'p-limit';
import type { Subscription } from 'rxjs';
import { combineLatest, firstValueFrom } from 'rxjs';
import type { Disposable, Uri } from 'vscode';
import { EventEmitter, workspace } from 'vscode';
import { Utils } from 'vscode-uri';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import type { AutodocsConfig } from '../config/autodocs';
import { autodocsConfig } from '../config/autodocs';
import { storiesGlobs } from '../config/storiesGlobs';
import {
  initialLoadCompleteContext,
  loadingStoriesContext,
} from '../constants/constants';
import { convertGlob } from '../globs/convertGlob';
import { convertGlobForWorkspace } from '../globs/convertGlobForWorkspace';
import { logError } from '../log/log';
import type { parseStoriesFile } from '../parser/parseStoriesFile';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { parseStoriesFileByUri } from '../parser/parseStoriesFileByUri';
import { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import { FileWatcher } from '../util/FileWatcher';
import { Mailbox } from '../util/Mailbox';
import { setContext } from '../util/setContext';
import { BackingMap } from './BackingMap';
import { findFilesByGlob } from './findFilesByGlob';
import { globMatchesUri } from './globMatchesUri';
import { sortStoryFiles } from './sortStoryFiles';

interface StoreMapEntry {
  parsed: ParsedStoryWithFileUri;
  specifiers: GlobSpecifier[];
}

const globSpecifierMatchesUri = (uri: Uri) => {
  return (globSpecifier: GlobSpecifier) =>
    globMatchesUri(convertGlob(globSpecifier), uri);
};

const setLoadingStories = (loading: boolean) => {
  setContext(loadingStoriesContext, loading);
};

const setInitialLoadComplete = (loading: boolean) => {
  setContext(initialLoadCompleteContext, loading);
};

const MAX_CONCURRENT_FIND_OPERATIONS = 3;

export const unattachedFirstComparator = (
  a: NonNullable<ReturnType<typeof parseStoriesFile>>,
  b: NonNullable<ReturnType<typeof parseStoriesFile>>,
): number => +!!a.meta.of - +!!b.meta.of;

export class StoryStore {
  private readonly backingMap = new BackingMap();
  private globWatchers: Disposable[] = [];
  private readonly initWaiter = new Mailbox<void>();

  private readonly configWatcher: Subscription;

  private readonly onDidUpdateStoryStoreEmitter = new EventEmitter<void>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidUpdateStoryStore =
    this.onDidUpdateStoryStoreEmitter.event;

  private readonly textDocumentChangeListener =
    workspace.onDidChangeTextDocument(async (ev) => {
      await this.refresh(ev.document.uri);
    });

  private constructor() {
    this.configWatcher = combineLatest([
      storiesGlobs,
      autodocsConfig,
    ]).subscribe(() => {
      this.refreshAll().catch((e) => {
        logError(
          'Failed to initialize story store after globs config change',
          e,
        );
      });
    });
  }

  public static async init() {
    const storyStore = new StoryStore();
    await storyStore.init();

    return storyStore;
  }

  public async set(uri: Uri, info: StoreMapEntry) {
    this.setWithoutNotify(uri, info, await firstValueFrom(autodocsConfig));
    this.refreshAttachedFiles();

    this.onDidUpdateStoryStoreEmitter.fire();
  }

  public delete(uri: Uri) {
    if (this.backingMap.delete(uri)) {
      this.refreshAttachedFiles();
      this.onDidUpdateStoryStoreEmitter.fire();
    }
  }

  public getStoryById(id: string) {
    // FUTURE: index stories by ID to avoid having to traverse the existing map
    for (const { storyFile } of this.backingMap.values()) {
      const stories = storyFile.getStoriesAndDocs();
      const match = stories.find((story) => story.id === id);
      if (match) {
        return match;
      }
    }

    return undefined;
  }

  public getStoryByUri(uri: Uri) {
    return this.backingMap.get(uri)?.storyFile;
  }

  public getStoryByExtensionlessUri(uri: Uri) {
    const extensions = [
      '',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.cjs',
      '.mjs',
    ] as const;
    const dirname = Utils.dirname(uri);
    const basename = Utils.basename(uri);

    for (const extension of extensions) {
      const potentialUri = Utils.joinPath(dirname, `${basename}${extension}`);

      const storyFile = this.getStoryByUri(potentialUri);

      if (storyFile) {
        return storyFile;
      }
    }
  }

  public getStoryFiles() {
    return Array.from(this.backingMap.values()).map((value) => value.storyFile);
  }

  public async getSortedStoryFiles() {
    const globSpecifiers = await firstValueFrom(storiesGlobs, {
      defaultValue: undefined,
    });

    if (!globSpecifiers) {
      return [];
    }

    const unsortedFiles = Array.from(this.backingMap.values()).map(
      (value) => value.storyFile,
    );

    return sortStoryFiles(unsortedFiles, globSpecifiers);
  }

  public async waitUntilInitialized() {
    return this.initWaiter.get().then(() => this);
  }

  public async isStoryFile(uri: Uri) {
    const globSpecifiers =
      (await firstValueFrom(storiesGlobs, { defaultValue: undefined })) ?? [];

    return globSpecifiers.some(globSpecifierMatchesUri(uri));
  }

  public async getGlobSpecifiers(uri: Uri) {
    const globSpecifiers =
      (await firstValueFrom(storiesGlobs, { defaultValue: undefined })) ?? [];

    return globSpecifiers.filter(globSpecifierMatchesUri(uri));
  }

  public refreshAll() {
    this.clearBackingMap();
    this.clearGlobWatchers();
    return this.init();
  }

  public async refresh(uri: Uri) {
    const globSpecifiers = await this.getGlobSpecifiers(uri);

    const storyInfo =
      globSpecifiers.length > 0 ? await parseStoriesFileByUri(uri) : undefined;

    if (storyInfo) {
      await this.set(uri, { parsed: storyInfo, specifiers: globSpecifiers });
    } else {
      this.delete(uri);
    }
  }

  public getStoriesAttachedToUri(uri: Uri) {
    // FUTURE: index stories by attached file URI to avoid having to traverse the existing map
    return Array.from(this.backingMap.values())
      .filter(
        (entry) =>
          entry.storyFile.getDocs()?.getAttachedFile()?.getUri().toString() ===
          uri.toString(),
      )
      .map((entry) => entry.storyFile);
  }

  public dispose() {
    this.configWatcher.unsubscribe();
    this.textDocumentChangeListener.dispose();
    this.clearBackingMap();
    this.clearGlobWatchers();
    this.initWaiter.dispose();
  }

  private async init() {
    const globSpecifiers =
      (await firstValueFrom(storiesGlobs, { defaultValue: undefined })) ?? [];

    const autodocs = await firstValueFrom(autodocsConfig);

    setLoadingStories(true);

    this.globWatchers.push(
      ...globSpecifiers.map((globSpecifier) => {
        const { globPattern } = convertGlobForWorkspace(globSpecifier);

        return new FileWatcher(
          globPattern,
          (uri) => {
            this.refresh(uri).catch((e) => {
              logError(
                'Failed to parse story from story store glob file watcher',
                e,
                globPattern,
                uri,
              );
            });
          },
          false,
          true,
          true,
        );
      }),
    );

    const limit = pLimit(MAX_CONCURRENT_FIND_OPERATIONS);
    const input = globSpecifiers.map((globSpecifier) =>
      limit(async () => ({
        globSpecifier,
        storiesFiles: await Promise.all(
          (await findFilesByGlob(globSpecifier)).map(parseStoriesFileByUri),
        ),
      })),
    );

    const map = (await Promise.all(input)).reduce((acc, cur) => {
      cur.storiesFiles.forEach((storyFile) => {
        if (storyFile) {
          const key = storyFile.file.toString();
          const entry = acc.get(key);
          const existingSpecifiers = entry?.specifiers ?? [];

          acc.set(key, {
            parsed: storyFile,
            specifiers: [...existingSpecifiers, cur.globSpecifier],
          });
        }
      });

      return acc;
    }, new Map<string, StoreMapEntry>());

    const valuesWithUnattachedFirst = Array.from(map.values()).sort((a, b) =>
      unattachedFirstComparator(a.parsed, b.parsed),
    );

    for (const value of valuesWithUnattachedFirst) {
      this.setWithoutNotify(value.parsed.file, value, autodocs);
    }

    this.onDidUpdateStoryStoreEmitter.fire();

    this.initWaiter.put();

    setInitialLoadComplete(true);
    setLoadingStories(false);
  }

  private setWithoutNotify(
    uri: Uri,
    info: StoreMapEntry,
    autodocs: AutodocsConfig | undefined,
  ) {
    const watcher =
      this.backingMap.get(uri)?.fileWatcher ??
      new FileWatcher(uri, (watchedUri, eventType) => {
        if (eventType === 'delete') {
          this.delete(watchedUri);
        } else {
          this.refresh(watchedUri).catch((e) => {
            logError(
              'Failed to refresh story store from story file watcher',
              e,
              watchedUri,
              eventType,
            );
          });
        }
      });

    this.backingMap.set(uri, {
      storyFile: new StoryExplorerStoryFile(
        info.parsed,
        info.specifiers,
        this,
        autodocs,
      ),
      fileWatcher: watcher,
    });
  }

  private refreshAttachedFiles() {
    // We conservatively consider all attached docs as "affected", since their
    // resolution could conceivably be missing (or even change).
    const affectedStories = this.getStoryFiles().filter((file) =>
      file.isAttachedDoc(),
    );
    affectedStories.forEach((storyFile) => {
      this.refreshAttachedDoc(storyFile.getUri());
    });
  }

  private refreshAttachedDoc(uri: Uri) {
    const existingEntry = this.backingMap.get(uri);
    if (!existingEntry) {
      return;
    }

    const newStoryFile = existingEntry.storyFile.withRefreshedAttachedDoc(this);
    this.backingMap.set(uri, {
      fileWatcher: existingEntry.fileWatcher,
      storyFile: newStoryFile,
    });
  }

  private clearBackingMap() {
    this.backingMap.clear();
  }

  private clearGlobWatchers() {
    this.globWatchers.forEach((globWatcher) => {
      globWatcher.dispose();
    });
    this.globWatchers = [];
  }
}
