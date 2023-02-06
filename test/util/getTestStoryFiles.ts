import { join, resolve } from 'path';
import { vitest } from 'vitest';
import { Uri } from 'vscode';
import { mockAutodocsSubject } from '../../src/config/__mocks__/autodocs';
import type { AutodocsConfig } from '../../src/config/autodocs';
import { interpretStoriesConfigItem } from '../../src/config/interpretStoriesConfigItem';
import type { ParsedStoryWithFileUri } from '../../src/parser/parseStoriesFileByUri';
import { sortStoryFiles } from '../../src/store/sortStoryFiles';
import { StoryExplorerStoryFile } from '../../src/story/StoryExplorerStoryFile';
import { getStoriesGlobs } from '../../src/storybook/getStoriesGlobs';
import { parseLocalConfigFile } from '../../src/storybook/parseLocalConfigFile';
import { parseTestProjectStories } from './parseTestProjectStories';
import { testBaseDir } from './testBaseDir';

vitest.mock('../../src/config/autodocs');

export type TestProjectVersion = '6' | '7';

export const getTestStoryFiles = async (
  version: TestProjectVersion,
  configDir: string,
  { defaultGlobsIncludesAllMdx }: { defaultGlobsIncludesAllMdx: boolean },
) => {
  const tests = parseTestProjectStories();

  const storybookConfigDirRelativePath = join(
    'project',
    `v${version}`,
    configDir,
  );
  const storybookConfigPath = resolve(
    testBaseDir,
    storybookConfigDirRelativePath,
    'main.js',
  );

  const mockConfig = parseLocalConfigFile(storybookConfigPath)!;
  const storiesGlobs = await getStoriesGlobs(mockConfig.stories);
  const mockSpecifiers = await Promise.all(
    storiesGlobs.map((config) =>
      interpretStoriesConfigItem(
        config,
        Uri.file(resolve('/mock/basedir', storybookConfigDirRelativePath)),
        { defaultGlobsIncludesAllMdx },
      ),
    ),
  );

  const autodocsConfig = mockConfig.docs
    ? ({
        autodocs: mockConfig.docs.autodocs ?? 'tag',
        defaultName: mockConfig.docs.defaultName ?? 'Docs',
      } satisfies AutodocsConfig)
    : undefined;

  mockAutodocsSubject.next(autodocsConfig);

  const storyFiles = tests.flatMap(({ file, parsedRaw }) => {
    const parsed: ParsedStoryWithFileUri = {
      ...parsedRaw,
      file: Uri.file(`/mock/basedir/${file}`),
    };

    return new StoryExplorerStoryFile(parsed, mockSpecifiers, autodocsConfig);
  });

  return sortStoryFiles(storyFiles, mockSpecifiers);
};
