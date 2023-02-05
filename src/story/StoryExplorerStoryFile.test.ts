import { describe, expect, it } from 'vitest';
import { URI } from 'vscode-uri';
import { parseTestProjectStories } from '../../test/util/parseTestProjectStories';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

describe('StoryExplorerStoryFile', () => {
  const tests = parseTestProjectStories();

  tests.forEach(({ file, parsedRaw }) => {
    it(`parses story file ${file}`, () => {
      const parsed: ParsedStoryWithFileUri = {
        ...parsedRaw,
        file: URI.file(`/mock/basedir/${file}`),
      };

      const storyFile = new StoryExplorerStoryFile(parsed, [
        {
          directory: URI.file('/mock/basedir/project/src/autoTitle'),
          files: '**/*',
          titlePrefix: 'Auto-generated title prefix',
        },
        {
          directory: URI.file('/mock/basedir/project/src'),
          files: '**/*',
          titlePrefix: '',
        },
      ]);

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
