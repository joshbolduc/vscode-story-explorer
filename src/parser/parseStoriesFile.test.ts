import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { sync } from 'fast-glob';
import { testBaseDir } from '../../test/util/testBaseDir';
import { parseStoriesFile } from './parseStoriesFile';

describe('parseStoriesFile', () => {
  const tests = sync(['project/src/**/*.stories.*', 'fixtures/**/*'], {
    cwd: testBaseDir,
  });

  tests.forEach((match) => {
    it(`parses story file ${match}`, () => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const result = parseStoriesFile(contents, basename(match));

      expect(result).toMatchSnapshot();
    });
  });
});
