import { readFile } from 'fs/promises';
import { resolve } from 'path';
import merge from 'lodash/merge';
import { Uri } from 'vscode';
import { interpretStoriesConfigItem } from '../../src/config/normalizeStoriesEntry';
import type { ParsedStoryWithFileUri } from '../../src/parser/parseStoriesFileByUri';
import { StoryExplorerStoryFile } from '../../src/story/StoryExplorerStoryFile';
import { getStoriesGlobs } from '../../src/storybook/getStoriesGlobs';
import { parseLocalConfigFile } from '../../src/storybook/parseLocalConfigFile';
import { parseTestProjectStories } from '../util/parseTestProjectStories';
import { testBaseDir } from '../util/testBaseDir';

interface StoriesJsonV3Map {
  [id: string]: {
    id: string;
    name: string;
    title: string;
    importPath: string;
    kind: string;
    story: string;
    parameters: {
      fileName: string;
      framework: string;
      __id: string;
      __isArgsStory: boolean;
    };
  };
}

interface StoriesJsonV3 {
  v: 3;
  stories: StoriesJsonV3Map;
}

describe('stories.json', () => {
  it('matches storybook-generated stories.json', async () => {
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

    type StoryTestInfo = {
      id: string;
      name: string;
      title: string;
    };

    const transformedStoriesJson = tests
      .flatMap(({ file, parsedRaw }) => {
        const parsed: ParsedStoryWithFileUri = {
          ...parsedRaw,
          file: Uri.file(`/mock/basedir/${file}`),
        };

        const storyFile = new StoryExplorerStoryFile(parsed, mockSpecifiers);

        return storyFile
          .getAllStories()
          .filter((story) => !story.isDocs || story.getFile().isDocsOnly())
          .map((story) => ({
            id: story.id,
            name: story.name,
            title: story.getFile().getTitle()!,
          }));
      })
      .reduce<Record<string, StoryTestInfo>>((acc, cur) => {
        acc[cur.id] = cur;

        return acc;
      }, {});

    // This file is assumed to be generated in advance and up-to-date
    const generatedStoriesJsonStr = await readFile(
      resolve(testBaseDir, 'project', 'stories.json'),
    );

    const storiesJson = JSON.parse(
      generatedStoriesJsonStr.toString(),
    ) as StoriesJsonV3;

    const referenceStories = Object.entries(storiesJson.stories).reduce<
      Record<string, StoryTestInfo>
    >((acc, [id, story]) => {
      acc[id] = {
        id: story.id,
        name: story.name,
        title: story.title,
      };
      return acc;
    }, {});

    const corrections = {
      // BUG: name assigned to MDX story importing CSF story is not reflected in
      // imported CSF story
      'example-basic-csf--small': {
        name: 'Story with name, story, body',
      },
      // BUG: importing a CSF story in an MDX file does not honor the CSF
      // storyName
      'example-mdx-importing-csf--basic': {
        name: 'Story name from JS',
      },
    };

    expect(merge(transformedStoriesJson, corrections)).toEqual(
      referenceStories,
    );
  });
});
