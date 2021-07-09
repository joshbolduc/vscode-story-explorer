import { Position, Range, TextDocument } from 'vscode';
import { logError } from '../log/log';
import type { StoryStore } from '../store/StoryStore';

export const getRangeForCompletion = (
  document: TextDocument,
  position: Position,
  storyStore: StoryStore,
  regex: RegExp,
  replace: boolean,
) => {
  if (!storyStore.isStoryFile(document.uri)) {
    return undefined;
  }

  const lineText = document.lineAt(position).text;

  const matches = regex.exec(lineText);
  if (!matches?.groups) {
    return undefined;
  }

  const {
    groups: { leading, match, quote },
  } = matches;

  if (leading === undefined || match === undefined || quote === undefined) {
    logError('Missing expected groups in regular expression', {
      leading,
      match,
      quote,
    });
    return undefined;
  }

  const startPos = leading.length;
  const insertingEndPos = position.character;
  const replacingEndPos = startPos + quote.length + match.length - 1;

  const inserting = new Range(
    position.line,
    startPos,
    position.line,
    insertingEndPos,
  );
  const replacing = new Range(
    position.line,
    startPos,
    position.line,
    replacingEndPos,
  );

  return replace ? replacing : { inserting, replacing };
};
