import type { Uri } from 'vscode';
import { parseTestProjectStories } from '../../test/util/parseTestProjectStories';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

describe('StoryExplorerStoryFile', () => {
  const tests = parseTestProjectStories();

  tests.forEach(({ file, parsedRaw }) => {
    it(`parses story file ${file}`, () => {
      const parsed: ParsedStoryWithFileUri = {
        ...parsedRaw,
        file: {
          path: `/mock/basedir/${file}`,
        } as Uri,
      };

      const storyFile = new StoryExplorerStoryFile(parsed, [
        {
          directory: '/mock/basedir/project/src/autoTitle',
          files: '**/*',
          titlePrefix: 'Auto-generated title prefix',
        },
        {
          directory: '/mock/basedir/project/src',
          files: '**/*',
          titlePrefix: '',
        },
      ]);

      const stories = storyFile
        .getAllStories()
        .map(({ id, name, isDocs }) => ({ id, name, isDocs }));

      expect({
        id: storyFile.getId(),
        title: storyFile.getTitle(),
        isDocsOnly: storyFile.isDocsOnly(),
        stories,
      }).toMatchSnapshot();
    });
  });
});
