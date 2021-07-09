import { readFileSync } from 'fs';
import { join } from 'path';
import { sync } from 'fast-glob';
import { testBaseDir } from '../../../test/util/testBaseDir';
import { parseFromContents } from './parseFromContents';

describe('csf', () => {
  const tests = sync(['project/src/**/*.stories.{js,jsx,ts,tsx}'], {
    cwd: testBaseDir,
  });

  tests.forEach((match) => {
    it(`parses story file ${match}`, () => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const result = parseFromContents(contents);

      expect(result).toMatchSnapshot();
    });
  });
});
