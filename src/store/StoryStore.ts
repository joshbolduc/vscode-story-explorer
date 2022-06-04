import pLimit from 'p-limit';
import { Disposable, EventEmitter, Uri, workspace } from 'vscode';
import type { ConfigManager } from '../config/ConfigManager';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import { convertGlob } from '../globs/convertGlob';
import { convertGlobForWorkspace } from '../globs/convertGlobForWorkspace';
import { logError, logWarn } from '../log/log';
import {
  ParsedStoryWithFileUri,
  parseStoriesFileByUri,
} from '../parser/parseStoriesFileByUri';
import { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import { FileWatcher } from '../util/FileWatcher';
import { Mailbox } from '../util/Mailbox';
import { strCompareFn } from '../util/strCompareFn';
import { BackingMap } from './BackingMap';
import { findFilesByGlob } from './findFilesByGlob';

interface StoreMapEntry {
  parsed: ParsedStoryWithFileUri;
  specifiers: GlobSpecifier[];
}

const globSpecifierMatchesUri = (uri: Uri) => {
  return (globSpecifier: GlobSpecifier) => {
    const { filter, globPattern } = convertGlob(globSpecifier);

    return filter?.(uri.path) ?? globPattern === uri.path;
  };
};

const MAX_CONCURRENT_FIND_OPERATIONS = 3;

export class StoryStore {
  private readonly backingMap = new BackingMap();
  private globWatchers: Disposable[] = [];
  private readonly initWaiter = new Mailbox<void>();

  private readonly configWatcher: Disposable;

  private readonly onDidUpdateStoryStoreEmitter = new EventEmitter<void>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidUpdateStoryStore =
    this.onDidUpdateStoryStoreEmitter.event;

  private readonly textDocumentChangeListener =
    workspace.onDidChangeTextDocument(async (ev) => {
      await this.refresh(ev.document.uri);
    });

  private constructor(private readonly configManager: ConfigManager) {
    this.configWatcher = configManager.onDidChangeStoriesGlobsConfig(() => {
      this.clearBackingMap();
      this.clearGlobWatchers();
      this.init().catch((e) => {
        logError(
          'Failed to initialize story store after globs config change',
          e,
        );
      });
    });
  }

  public static async init(configManager: ConfigManager) {
    const storyStore = new StoryStore(configManager);
    await storyStore.init();

    return storyStore;
  }

  public set(uri: Uri, info: StoreMapEntry) {
    this.setWithoutNotify(uri, info);
    this.onDidUpdateStoryStoreEmitter.fire();
  }

  public delete(uri: Uri) {
    this.backingMap.delete(uri);
    this.onDidUpdateStoryStoreEmitter.fire();
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

  public getSortedStoryFiles() {
    const unsortedFiles = Array.from(this.backingMap.values())
      .map((value) => value.storyFile)
      .sort((a, b) => {
        return strCompareFn(a.getUri().path, b.getUri().path);
      });

    const sortedFiles: StoryExplorerStoryFile[] = [];

    const globSpecifiers = this.configManager.getStoriesGlobsConfig();

    const convertedGlobs = globSpecifiers.map((globSpecifier) =>
      convertGlob(globSpecifier),
    );

    let remainingToSort = new Set(unsortedFiles);

    convertedGlobs.forEach((glob) => {
      remainingToSort = Array.from(remainingToSort).reduce((acc, file) => {
        const filePath = file.getUri().path;
        const matchesGlob = glob.filter
          ? glob.filter(filePath)
          : glob.globPattern === filePath;

        if (matchesGlob) {
          sortedFiles.push(file);
          acc.delete(file);
        }

        return acc;
      }, remainingToSort);
    });

    if (remainingToSort.size > 0) {
      logWarn(
        'Unexpected condition: found unsorted items remaining',
        remainingToSort.size,
        remainingToSort,
      );
    }

    return sortedFiles;
  }

  public async waitUntilInitialized() {
    return this.initWaiter.get().then(() => this);
  }

  public isStoryFile(uri: Uri) {
    const globSpecifiers = this.configManager.getStoriesGlobsConfig();

    return globSpecifiers.some(globSpecifierMatchesUri(uri));
  }

  public getGlobSpecifiers(uri: Uri) {
    const globSpecifiers = this.configManager.getStoriesGlobsConfig();

    return globSpecifiers.filter(globSpecifierMatchesUri(uri));
  }

  public async refresh(uri: Uri) {
    const globSpecifiers = this.getGlobSpecifiers(uri);

    const storyInfo =
      globSpecifiers.length > 0 ? await parseStoriesFileByUri(uri) : undefined;

    if (storyInfo) {
      this.set(uri, { parsed: storyInfo, specifiers: globSpecifiers });
    } else {
      this.delete(uri);
    }
  }

  public dispose() {
    this.configWatcher.dispose();
    this.textDocumentChangeListener.dispose();
    this.clearBackingMap();
    this.clearGlobWatchers();
    this.initWaiter.dispose();
  }

  private async init() {
    const globSpecifiers = this.configManager.getStoriesGlobsConfig();

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
          const key = storyFile.file.path;
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
  }

  private setWithoutNotify(uri: Uri, info: StoreMapEntry) {
    const path = uri.path;

    const watcher =
      this.backingMap.get(uri)?.fileWatcher ??
      new FileWatcher(path, (watchedUri, eventType) => {
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
