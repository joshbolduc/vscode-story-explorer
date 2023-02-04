import { resolve } from 'path';
import { Uri } from 'vscode';
import { interpretStoriesConfigItem } from '../../src/config/normalizeStoriesEntry';
import type { ParsedStoryWithFileUri } from '../../src/parser/parseStoriesFileByUri';
import { sortStoryFiles } from '../../src/store/sortStoryFiles';
import { StoryExplorerStoryFile } from '../../src/story/StoryExplorerStoryFile';
import { getStoriesGlobs } from '../../src/storybook/getStoriesGlobs';
import { parseLocalConfigFile } from '../../src/storybook/parseLocalConfigFile';
import { parseTestProjectStories } from './parseTestProjectStories';
import { testBaseDir } from './testBaseDir';

export const getTestStoryFiles = async () => {
  const tests = parseTestProjectStories();

  const storybookConfigPath = resolve(
    testBaseDir,
    'project',
    '.storybook',
    'main.js',
  );

  const mockConfig = parseLocalConfigFile(storybookConfigPath)!;
  const storiesGlobs = await getStoriesGlobs(mockConfig.stories);
  const mockSpecifiers = await Promise.all(
    storiesGlobs.map((config) =>
      interpretStoriesConfigItem(
        config,
        Uri.file('/mock/basedir/project/.storybook'),
      ),
    ),
  );

  const storyFiles = tests.flatMap(({ file, parsedRaw }) => {
    const parsed: ParsedStoryWithFileUri = {
      ...parsedRaw,
      file: Uri.file(`/mock/basedir/${file}`),
    };

    return new StoryExplorerStoryFile(parsed, mockSpecifiers);
  });

  return sortStoryFiles(storyFiles, mockSpecifiers);
};
