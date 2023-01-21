import { CompletionItem, CompletionItemKind } from 'vscode';
import type { PartialOrUndefined } from '../types/PartialOrUndefined';

export class TextCompletionItem extends CompletionItem {
  private constructor(
    name: CompletionItem['label'],
    {
      commitCharacters,
      range,
    }: PartialOrUndefined<Pick<CompletionItem, 'commitCharacters' | 'range'>>,
  ) {
    super(name, CompletionItemKind.Text);

    if (range !== undefined) {
      this.range = range;
    }
    if (commitCharacters !== undefined) {
      this.commitCharacters = commitCharacters;
    }
  }

  public static create(
    name: CompletionItem['label'],
    {
      commitCharacters,
      range,
    }: PartialOrUndefined<Pick<CompletionItem, 'commitCharacters' | 'range'>>,
  ) {
    return new TextCompletionItem(name, { commitCharacters, range });
  }
}
