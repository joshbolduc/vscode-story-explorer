import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { sync } from 'fast-glob';
import { parseStoriesFile } from '../../src/parser/parseStoriesFile';
import { testBaseDir } from './testBaseDir';

type ParsedStoriesFileResult = ReturnType<typeof parseStoriesFile>;

export const parseTestProjectStories = () =>
  sync(['project/src/**/*.stories.*'], {
    cwd: testBaseDir,
  })
    .map((file) => {
      const storiesPath = join(testBaseDir, file);
      const contents = readFileSync(storiesPath).toString();
      const parsedRaw = parseStoriesFile(contents, basename(file));

      return { file, parsedRaw };
    })
    .filter(
      (
        result,
      ): result is {
        file: string;
        parsedRaw: NonNullable<ParsedStoriesFileResult>;
      } => !!result.parsedRaw,
    );
