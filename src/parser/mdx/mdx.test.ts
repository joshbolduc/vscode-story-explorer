import { readFileSync } from 'fs';
import { join } from 'path';
import { sync } from 'fast-glob';
import { testBaseDir } from '../../../test/util/testBaseDir';

import { tryParseMdx } from './mdx';

describe('mdx', () => {
  const tests = sync(['project/src/**/*.stories.mdx', 'fixtures/**/*.mdx'], {
    cwd: testBaseDir,
  });

  tests.forEach((match) => {
    it(`parses story file ${match}`, () => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const result = tryParseMdx(contents);

      expect(result).toMatchSnapshot();
    });
  });
});
