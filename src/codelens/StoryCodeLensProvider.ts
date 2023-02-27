import { firstValueFrom } from 'rxjs';
import {
  CodeLens,
  CodeLensProvider,
  EventEmitter,
  Range,
  TextDocument,
} from 'vscode';
import { autodocsConfig } from '../config/autodocs';
import { storiesGlobs } from '../config/storiesGlobs';
import {
  openPreviewInBrowserCommand,
  openPreviewToSideCommand,
} from '../constants/constants';
import { parseStoriesFile } from '../parser/parseStoriesFile';
import type { StoryStore } from '../store/StoryStore';
import { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { SettingsWatcher } from '../util/SettingsWatcher';
import { isDefined } from '../util/guards/isDefined';

export class StoryCodeLensProvider implements CodeLensProvider {
  private readonly onDidChangeCodeLensesEmitter = new EventEmitter<void>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;
  private readonly storiesGlobsListener = storiesGlobs.subscribe(() => {
    this.onDidChangeCodeLensesEmitter.fire();
  });

  private constructor(
    private readonly storyStore: StoryStore,
    private readonly docsSettingsWatcher: SettingsWatcher,
    private readonly storiesSettingsWatcher: SettingsWatcher,
  ) {}

  public static init(
    storyStore: StoryStore,
    docsSettingsWatcher: SettingsWatcher,
    storiesSettingsWatcher: SettingsWatcher,
  ) {
    const provider = new StoryCodeLensProvider(
      storyStore,
      docsSettingsWatcher,
      storiesSettingsWatcher,
    );

    return provider;
  }

  public async provideCodeLenses(
    document: TextDocument,
  ): Promise<CodeLens[] | undefined> {
    const showStories = this.storiesSettingsWatcher.read(document) !== false;
    const showDocs = this.docsSettingsWatcher.read(document) !== false;

    if (!showStories && !showDocs) {
      return;
    }

    // FUTURE: instead of parsing the file again, consider re-using existing
    // results in the story store. Would need to make sure results aren't stale
    // and are updated when the story store updates.

    const globSpecifiers = await this.storyStore.getGlobSpecifiers(
      document.uri,
    );
    if (globSpecifiers.length === 0) {
      return;
    }

    const contents = document.getText();

    const parsed = parseStoriesFile(contents, document.uri.path);
    if (!parsed) {
      return;
    }

    const autodocs = await firstValueFrom(autodocsConfig);

    const storyFile = new StoryExplorerStoryFile(
      {
        file: document.uri,
        ...parsed,
      },
      globSpecifiers,
      this.storyStore,
      autodocs,
    );

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

    const docs = storyFile.getDocs();
    if (showDocs && docs) {
      lenses.push(
        new CodeLens(new Range(0, 0, 0, 0), {
          command: openPreviewToSideCommand,
          title: 'Preview Docs',
          arguments: [docs],
        }),
        new CodeLens(new Range(0, 0, 0, 0), {
          command: openPreviewInBrowserCommand,
          title: 'Open Docs in Browser',
          arguments: [docs],
        }),
      );
    }

    return lenses;
  }

  public refresh() {
    this.onDidChangeCodeLensesEmitter.fire();
  }

  public dispose() {
    this.storiesGlobsListener.unsubscribe();
    this.onDidChangeCodeLensesEmitter.dispose();
  }
}
