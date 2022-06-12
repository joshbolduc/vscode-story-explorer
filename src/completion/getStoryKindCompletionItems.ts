import type { Uri } from 'vscode';
import type { StoryStore } from '../store/StoryStore';
import { splitKind } from '../util/splitKind';
import { TextCompletionItem } from './TextCompletionItem';

const getStoryKindSegments = (storyStore: StoryStore, ignoreUri: Uri) => {
  return storyStore.getStoryFiles().reduce((acc, cur) => {
    if (cur.getUri().toString() !== ignoreUri.toString()) {
      const title = cur.getTitle();
      if (title && typeof title === 'string') {
        const segments = splitKind(title);
        segments.forEach((segment, i) => {
          acc.add(segments.slice(0, i + 1).join('/'));
        });
      }
    }

    return acc;
  }, new Set<string>());
};

export const getStoryKindCompletionItems = (
  storyStore: StoryStore,
  ignoreUri: Uri,
  range: TextCompletionItem['range'],
) => {
  const segmentSet = getStoryKindSegments(storyStore, ignoreUri);

  return Array.from(segmentSet.values()).map((title) =>
    TextCompletionItem.create(title, { range, commitCharacters: ['/'] }),
  );
};
