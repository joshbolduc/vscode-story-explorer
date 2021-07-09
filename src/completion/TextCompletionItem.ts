import { CompletionItem, CompletionItemKind } from 'vscode';

export class TextCompletionItem extends CompletionItem {
  private constructor(
    name: CompletionItem['label'],
    {
      commitCharacters,
      range,
    }: Pick<CompletionItem, 'commitCharacters' | 'range'>,
  ) {
    super(name, CompletionItemKind.Text);

    this.range = range;
    this.commitCharacters = commitCharacters;
  }

  public static create(
    name: CompletionItem['label'],
    {
      commitCharacters,
      range,
    }: Pick<CompletionItem, 'commitCharacters' | 'range'>,
  ) {
    return new TextCompletionItem(name, { commitCharacters, range });
  }
}
