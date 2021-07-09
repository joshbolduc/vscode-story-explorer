import type {
  CompletionItemProvider,
  CompletionList,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode';
import type { StoryStore } from '../store/StoryStore';
import type { TextCompletionItem } from './TextCompletionItem';
import { getRangeForCompletion } from './getRangeForCompletion';
import { getStoryKindCompletionItems } from './getStoryKindCompletionItems';

export class CsfTitleCompletionProvider
  implements CompletionItemProvider<TextCompletionItem>
{
  public constructor(private readonly storyStore: StoryStore) {}

  public provideCompletionItems(
    document: TextDocument,
    position: Position,
  ): ProviderResult<TextCompletionItem[] | CompletionList<TextCompletionItem>> {
    // FUTURE: reduce false positives, e.g., by determining if the position
    // appears to be defining a title property for the default (Meta) export

    const range = getRangeForCompletion(
      document,
      position,
      this.storyStore,
      /^(?<leading>.*title\s*:\s*(?<quote>["'`]))(?<match>(?:\\\2|(?:(?!\2)).)*)(\2)?/,
      false,
    );

    if (range) {
      return getStoryKindCompletionItems(
        this.storyStore,
        document.uri.fsPath,
        range,
      );
    }
  }
}
