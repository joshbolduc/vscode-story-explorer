import type { Uri } from 'vscode';
import type { StoryStore } from '../store/StoryStore';
import { TextCompletionItem } from './TextCompletionItem';

const getStoryKindSegments = (storyStore: StoryStore, ignoreUri: Uri) => {
  return storyStore.getStoryFiles().reduce((acc, cur) => {
    const ignoreUriStr = ignoreUri.toString();
    // Don't make suggestions derived from this file, or any file attached to
    // this file (whose title segments are presumably derived from the very
    // input being completed)
    if (
      cur.getUri().toString() !== ignoreUriStr &&
      cur.getDocs()?.getAttachedFile()?.getUri().toString() !== ignoreUriStr
    ) {
      const segments = cur.getTitle();
      if (segments) {
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
