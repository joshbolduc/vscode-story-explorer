import pLimit from 'p-limit';
import { firstValueFrom, Subscription } from 'rxjs';
import { Disposable, EventEmitter, Uri, workspace } from 'vscode';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { storiesGlobs } from '../config/storiesGlobs';
import {
  initialLoadCompleteContext,
  loadingStoriesContext,
} from '../constants/constants';
import { convertGlob } from '../globs/convertGlob';
import { convertGlobForWorkspace } from '../globs/convertGlobForWorkspace';
import { logError } from '../log/log';
import {
  ParsedStoryWithFileUri,
  parseStoriesFileByUri,
} from '../parser/parseStoriesFileByUri';
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
    this.configWatcher = storiesGlobs.subscribe(() => {
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

  public set(uri: Uri, info: StoreMapEntry) {
    this.setWithoutNotify(uri, info);
    this.onDidUpdateStoryStoreEmitter.fire();
  }

  public delete(uri: Uri) {
    if (this.backingMap.delete(uri)) {
      this.onDidUpdateStoryStoreEmitter.fire();
    }
  }

  public getStoryById(id: string) {
    // FUTURE: index stories by ID to avoid having to traverse the existing map
    for (const { storyFile } of this.backingMap.values()) {
      const stories = storyFile.getAllStories();
      const match = stories.find((story) => story.id === id);
      if (match) {
        return match;
      }
    }

    return undefined;
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
      this.set(uri, { parsed: storyInfo, specifiers: globSpecifiers });
    } else {
      this.delete(uri);
    }
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

    for (const [, value] of map) {
      this.setWithoutNotify(value.parsed.file, value);
    }

    this.onDidUpdateStoryStoreEmitter.fire();

    this.initWaiter.put();

    setInitialLoadComplete(true);
    setLoadingStories(false);
  }

  private setWithoutNotify(uri: Uri, info: StoreMapEntry) {
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
      storyFile: new StoryExplorerStoryFile(info.parsed, info.specifiers),
      fileWatcher: watcher,
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
