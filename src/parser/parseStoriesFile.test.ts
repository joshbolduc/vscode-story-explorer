import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { sync } from 'fast-glob';
import { describe, expect, it } from 'vitest';
import { testBaseDir } from '../../test/util/testBaseDir';
import { parseStoriesFile } from './parseStoriesFile';

describe('parseStoriesFile', () => {
  const tests = sync(
    [
      'project/v6/src/autoTitle/**/*.stories.*',
      'project/v6/src/stories/v6-only/**/*.stories.*',
      'project/v7/src/**/*.stories.*',
      'project/v7/src/**/*.mdx',
      'fixtures/**/*',
    ],
    {
      cwd: testBaseDir,
    },
  );

  tests.forEach((match) => {
    it(`parses story file ${match}`, () => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const result = parseStoriesFile(contents, basename(match));

      expect(result).toMatchSnapshot();
    });
  });
});
