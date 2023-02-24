import { readFile } from 'fs/promises';
import { relative, resolve } from 'path';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { describe, expect, it } from 'vitest';
import {
  getTestStoryFiles,
  TestProjectVersion,
} from '../util/getTestStoryFiles';
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

interface StoryTestInfo {
  id: string;
  name: string;
  title: string;
  importPath: string;
}

describe('stories.json', () => {
  const configs: {
    version: TestProjectVersion;
    corrections?: Record<string, Partial<StoryTestInfo>>;
    exclusions?: string[];
  }[] = [
    {
      version: '6',
    },
    {
      version: '7',
      corrections: {
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
      },
    },
  ];

  configs.forEach(({ version, corrections, exclusions = [] }) =>
    it(`matches storybook-generated stories.json for v${version}`, async () => {
      const transformedStoriesJson = (await getTestStoryFiles(version))
        .flatMap((storyFile) => {
          return storyFile
            .getStoriesAndDocs()
            .filter(
              (story) =>
                story.type === 'story' ||
                // Only v6 includes docs-only stories in stories.json
                (version === '6' && storyFile.isDocsOnly()),
            )
            .map((story) => ({
              id: story.id,
              name: story.name,
              title: storyFile.getTitle()!,
              importPath: `./${relative(
                `/mock/basedir/project/v${version}`,
                storyFile.getUri().path,
              )}`,
            }));
        })
        .reduce<Record<string, StoryTestInfo>>((acc, cur) => {
          acc[cur.id] = cur;

          return acc;
        }, {});

      // This file is assumed to be generated in advance and up-to-date
      const generatedStoriesJsonStr = await readFile(
        resolve(testBaseDir, 'project', `v${version}`, 'stories.json'),
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
          importPath: story.importPath,
        };
        return acc;
      }, {});

      expect(
        omit(merge(transformedStoriesJson, corrections), exclusions),
      ).toEqual(referenceStories);
    }),
  );
});
