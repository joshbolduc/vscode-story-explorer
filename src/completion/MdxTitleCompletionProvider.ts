import type {
  CompletionItemProvider,
  CompletionList,
  Position,
  TextDocument,
} from 'vscode';
import type { StoryStore } from '../store/StoryStore';
import type { SettingsWatcher } from '../util/SettingsWatcher';
import type { TextCompletionItem } from './TextCompletionItem';
import { getRangeForCompletion } from './getRangeForCompletion';
import { getStoryKindCompletionItems } from './getStoryKindCompletionItems';

export class MdxTitleCompletionProvider
  implements CompletionItemProvider<TextCompletionItem>
{
  public constructor(
    private readonly storyStore: StoryStore,
    private readonly settingsWatcher: SettingsWatcher<boolean>,
  ) {}

  public async provideCompletionItems(
    document: TextDocument,
    position: Position,
  ): Promise<
    TextCompletionItem[] | CompletionList<TextCompletionItem> | undefined
  > {
    if (!this.settingsWatcher.read(document)) {
      return undefined;
    }

    // FUTURE: reduce false positives, e.g., by determining if the position
    // appears to be within props for a `<Meta />` element

    const range = await getRangeForCompletion(
      document,
      position,
      this.storyStore,
      /^(?<leading>.*title\s*=\s*(?<quote>["']))(?<match>(?:\\\2|(?:(?!\2)).)*)(\2)?/,
      false,
    );

    if (range) {
      return getStoryKindCompletionItems(this.storyStore, document.uri, range);
    }
  }
}
