import type { StoryStore } from '../store/StoryStore';
import { splitKind } from '../util/splitKind';
import { TextCompletionItem } from './TextCompletionItem';

const getStoryKindSegments = (storyStore: StoryStore, ignoreFsPath: string) => {
  return storyStore.getStoryFiles().reduce((acc, cur) => {
    if (cur.getUri().fsPath !== ignoreFsPath) {
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
  ignoreFsPath: string,
  range: TextCompletionItem['range'],
) => {
  const segmentSet = getStoryKindSegments(storyStore, ignoreFsPath);

  return Array.from(segmentSet.values()).map((title) =>
    TextCompletionItem.create(title, { range, commitCharacters: ['/'] }),
  );
};
