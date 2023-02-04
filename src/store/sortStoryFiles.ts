import type { GlobSpecifier } from '../config/GlobSpecifier';
import { convertGlob } from '../globs/convertGlob';
import { logWarn } from '../log/log';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import { strCompareFn } from '../util/strCompareFn';
import { globMatchesUri } from './globMatchesUri';

export const sortStoryFiles = (
  storyFiles: readonly StoryExplorerStoryFile[],
  globSpecifiers: readonly GlobSpecifier[],
) => {
  const filesSortedByUri = storyFiles.slice().sort((a, b) => {
    return strCompareFn(a.getUri().toString(), b.getUri().toString());
  });

  const sortedFiles: StoryExplorerStoryFile[] = [];

  const convertedGlobs = globSpecifiers.map((globSpecifier) =>
    convertGlob(globSpecifier),
  );

  let remainingToSort = new Set(filesSortedByUri);

  convertedGlobs.forEach((glob) => {
    remainingToSort = Array.from(remainingToSort).reduce((acc, file) => {
      const matchesGlob = globMatchesUri(glob, file.getUri());

      if (matchesGlob) {
        sortedFiles.push(file);
        acc.delete(file);
      }

      return acc;
    }, remainingToSort);
  });

  if (remainingToSort.size > 0) {
    logWarn(
      'Unexpected condition: found unsorted items remaining',
      remainingToSort.size,
      remainingToSort,
    );
  }

  return sortedFiles;
};
