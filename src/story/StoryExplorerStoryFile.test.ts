import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { sync } from 'fast-glob';
import type { Uri } from 'vscode';
import { testBaseDir } from '../../test/util/testBaseDir';
import { parseStoriesFile } from '../parser/parseStoriesFile';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

describe('StoryExplorerStoryFile', () => {
  const tests = sync(['project/src/**/*.stories.*'], {
    cwd: testBaseDir,
  })
    .map((file) => {
      const storiesPath = join(testBaseDir, file);
      const contents = readFileSync(storiesPath).toString();
      const parsedRaw = parseStoriesFile(contents, basename(file));

      return { file, parsedRaw };
    })
    .filter(({ parsedRaw }) => !!parsedRaw);

  tests.forEach(({ file, parsedRaw }) => {
    it(`parses story file ${file}`, () => {
      const parsed: ParsedStoryWithFileUri = {
        ...parsedRaw!,
        file: {
          path: `/mock/basedir/${file}`,
        } as Uri,
      };

      const storyFile = new StoryExplorerStoryFile(parsed, [
        {
          directory: '/mock/basedir/project/src',
          files: '**/*',
          titlePrefix: 'Auto-generated title prefix',
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
