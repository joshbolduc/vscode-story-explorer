import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { sync } from 'fast-glob';
import { describe, expect, it } from 'vitest';
import { testBaseDir } from '../../test/util/testBaseDir';
import type { CsfParseOptions } from './csf/csf';
import { parseStoriesFile } from './parseStoriesFile';

describe('parseStoriesFile', () => {
  const cases = [
    {
      globs: [
        'project/v6/src/autoTitle/**/*.stories.*',
        'project/v6/src/stories/v6-only/**/*.stories.*',
      ],
      options: { useLooseStoryNameSemantics: true },
    },
    {
      globs: [
        'project/v7/src/**/*.stories.*',
        'project/v7/src/**/*.mdx',
        'fixtures/**/*',
      ],
      options: { useLooseStoryNameSemantics: false },
    },
  ] satisfies { globs: string[]; options: CsfParseOptions }[];

  const tests = cases.flatMap((c) =>
    sync(c.globs, {
      cwd: testBaseDir,
    }).map((match) => ({
      ...c,
      match,
    })),
  );

  tests.forEach(({ match, options }) => {
    it(`parses story file ${match}`, () => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const result = parseStoriesFile(contents, options, basename(match));

      expect(result).toMatchSnapshot();
    });
  });
});
