import {
  CompletionItemProvider,
  CompletionList,
  Position,
  ProviderResult,
  TextDocument,
  workspace,
} from 'vscode';
import type { StoryStore } from '../store/StoryStore';
import { TextCompletionItem } from './TextCompletionItem';
import { getRangeForCompletion } from './getRangeForCompletion';

export class MdxStoryIdCompletionProvider
  implements CompletionItemProvider<TextCompletionItem>
{
  public constructor(private readonly storyStore: StoryStore) {}

  public provideCompletionItems(
    document: TextDocument,
    position: Position,
  ): ProviderResult<TextCompletionItem[] | CompletionList<TextCompletionItem>> {
    // FUTURE: reduce false positives, e.g., by determining if the position
    // appears to be within props for a `<Story />` element

    const range = getRangeForCompletion(
      document,
      position,
      this.storyStore,
      /^(?<leading>.*id\s*=\s*(?<quote>["']))(?<match>(?:\\\2|(?:(?!\2))[\w-])*)(\2)?/,
      true,
    );

    if (range) {
      return Array.from(this.getSuggestions().entries()).map(
        ([, { id, path }]) =>
          TextCompletionItem.create(
            { label: id, description: path },
            { range },
          ),
      );
    }
  }

  private getSuggestions() {
    return this.storyStore.getStoryFiles().reduce((acc, cur) => {
      cur.getStories().forEach((story) => {
        const id = story.id;
        const path = workspace.asRelativePath(story.getFile().getUri());

        acc.set(id, { id, path });
      });

      return acc;
    }, new Map<string, { id: string; path: string }>());
  }
}
