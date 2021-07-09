import {
  CodeLens,
  CodeLensProvider,
  Disposable,
  EventEmitter,
  Range,
  TextDocument,
} from 'vscode';
import type { ConfigManager } from '../config/ConfigManager';
import {
  openPreviewInBrowserCommand,
  openPreviewToSideCommand,
} from '../constants/constants';
import { parseStoriesFile } from '../parser/parseStoriesFile';
import type { StoryStore } from '../store/StoryStore';
import { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { SettingsWatcher } from '../util/SettingsWatcher';
import { isDefined } from '../util/isDefined';

export class StoryCodeLensProvider implements CodeLensProvider {
  private readonly onDidChangeCodeLensesEmitter = new EventEmitter<void>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;
  private readonly storiesGlobsListener: Disposable;

  private constructor(
    private readonly storyStore: StoryStore,
    private readonly docsSettingsWatcher: SettingsWatcher,
    private readonly storiesSettingsWatcher: SettingsWatcher,
    configManager: ConfigManager,
  ) {
    this.storiesGlobsListener = configManager.onDidChangeStoriesGlobsConfig(
      () => {
        this.onDidChangeCodeLensesEmitter.fire();
      },
    );
  }

  public static init(
    storyStore: StoryStore,
    docsSettingsWatcher: SettingsWatcher,
    storiesSettingsWatcher: SettingsWatcher,
    configManager: ConfigManager,
  ) {
    const provider = new StoryCodeLensProvider(
      storyStore,
      docsSettingsWatcher,
      storiesSettingsWatcher,
      configManager,
    );

    return provider;
  }

  public provideCodeLenses(document: TextDocument): CodeLens[] | undefined {
    const showStories = this.storiesSettingsWatcher.read() !== false;
    const showDocs = this.docsSettingsWatcher.read() !== false;

    // FUTURE: instead of parsing the file again, consider re-using existing
    // results in the story store. Would need to make sure results aren't stale
    // and are updated when the story store updates.

    if (!this.storyStore.isStoryFile(document.uri)) {
      return;
    }

    const contents = document.getText();

    const parsed = parseStoriesFile(contents, document.uri.path);
    if (!parsed) {
      return;
    }

    const storyFile = new StoryExplorerStoryFile({
      file: document.uri,
      ...parsed,
    });

    const lenses: CodeLens[] = [];

    if (showStories) {
      lenses.push(
        ...storyFile
          .getStories()
          .flatMap(({ id, location }) => {
            if (!location) {
              return;
            }

            const storedStory = this.storyStore.getStoryById(id);
            if (!storedStory) {
              return;
            }

            const range = new Range(
              location.start.line - 1,
              location.start.column,
              location.start.line - 1,
              location.start.column,
            );

            return [
              new CodeLens(range, {
                command: openPreviewToSideCommand,
                title: 'Preview Story',
                arguments: [storedStory],
              }),
              new CodeLens(range, {
                command: openPreviewInBrowserCommand,
                title: 'Open Story in Browser',
                arguments: [storedStory],
              }),
            ];
          })
          .filter(isDefined),
      );
    }

    const { docsStory } = storyFile;
    if (showDocs && docsStory) {
      lenses.push(
        new CodeLens(new Range(0, 0, 0, 0), {
          command: openPreviewToSideCommand,
          title: 'Preview Docs',
          arguments: [docsStory],
        }),
        new CodeLens(new Range(0, 0, 0, 0), {
          command: openPreviewInBrowserCommand,
          title: 'Open Docs in Browser',
          arguments: [docsStory],
        }),
      );
    }

    return lenses;
  }

  public refresh() {
    this.onDidChangeCodeLensesEmitter.fire();
  }

  public dispose() {
    this.storiesGlobsListener.dispose();
    this.onDidChangeCodeLensesEmitter.dispose();
  }
}
