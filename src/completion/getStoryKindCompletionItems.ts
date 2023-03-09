import type { Uri } from 'vscode';
import type { StoryStore } from '../store/StoryStore';
import { TextCompletionItem } from './TextCompletionItem';

const getStoryKindSegments = (
  storyStore: StoryStore,
  ignoreUri: Uri,
  prefix: string | undefined,
) => {
  const prefixSegments = prefix?.split('/');

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
      if (
        segments &&
        (!prefixSegments ||
          prefixSegments.every(
            (prefixSegment, i) => segments[i] === prefixSegment,
          ))
      ) {
        const suffixSegments = prefixSegments
          ? segments.slice(prefixSegments.length)
          : segments;
        suffixSegments.forEach((segment, i) => {
          acc.add(suffixSegments.slice(0, i + 1).join('/'));
        });
      }
    }

    return acc;
  }, new Set<string>());
};

export const getStoryKindCompletionItems = async (
  storyStore: StoryStore,
  ignoreUri: Uri,
  range: TextCompletionItem['range'],
) => {
  const [globSpecifier] = await storyStore.getGlobSpecifiers(ignoreUri);
  const prefix = globSpecifier?.titlePrefix || undefined;

  const segmentSet = getStoryKindSegments(storyStore, ignoreUri, prefix);

  return Array.from(segmentSet.values()).map((title) =>
    TextCompletionItem.create(title, { range, commitCharacters: ['/'] }),
  );
};
