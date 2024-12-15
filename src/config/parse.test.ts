import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { testBaseDir } from '../../test/util/testBaseDir';
import { parse } from './parse';

describe('parse', () => {
  const files = [
    'project/v6/.storybook/main.js',
    'project/v7/.storybook/main.ts',
    'project/v7/.config-async/main.ts',
    'project/v7/.config-named-exports/main.js',
    'project/v8/.storybook/main.js',
  ];

  files.forEach((file) => {
    it(`parses ${file}`, async () => {
      expect(await parse(join(testBaseDir, file))).toMatchSnapshot();
    });
  });
});
