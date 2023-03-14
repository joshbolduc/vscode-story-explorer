import { describe, expect, it } from 'vitest';
import { getTestStoryFiles } from '../../test/util/getTestStoryFiles';

describe('StoryExplorerStoryFile', async () => {
  const storyFiles = [
    ...(await getTestStoryFiles('6', '.config-unittest/main.js', {
      defaultGlobsIncludesAllMdx: false,
    })),
    ...(await getTestStoryFiles('7', '.storybook/main.ts', {
      defaultGlobsIncludesAllMdx: true,
    })),
  ];

  storyFiles.forEach((storyFile) => {
    it(`parses story file ${storyFile.getUri().toString()}`, () => {
      const stories = storyFile
        .getStoriesAndDocs()
        .map(({ id, name, type }) => ({ id, name, type }));

      expect({
        id: storyFile.getId(),
        title: storyFile.getTitle(),
        isDocsOnly: storyFile.isDocsOnly(),
        stories,
      }).toMatchSnapshot();
    });
  });
});
