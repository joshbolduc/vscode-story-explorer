import { readFileSync } from 'fs';
import { join } from 'path';
import { sync } from 'fast-glob';
import { describe, expect, it } from 'vitest';
import { testBaseDir } from '../../../test/util/testBaseDir';

import { tryParseMdx } from './mdx';

describe('mdx', () => {
  const tests = sync(
    [
      'project/v6/src/autoTitle/**/*.stories.mdx',
      'project/v6/src/stories/v6-only/**/*.stories.mdx',
      'project/v7/src/**/*.mdx',
      'fixtures/**/*.mdx',
    ],
    {
      cwd: testBaseDir,
    },
  );

  tests.forEach((match) => {
    it(`parses story file ${match}`, () => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const result = tryParseMdx(contents);

      expect(result).toMatchSnapshot();
    });
  });
});
