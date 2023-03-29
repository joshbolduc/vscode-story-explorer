import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { sync } from 'fast-glob';
import type { CsfParseOptions } from '../../src/parser/csf/csf';
import { parseStoriesFile } from '../../src/parser/parseStoriesFile';
import { testBaseDir } from './testBaseDir';

type ParsedStoriesFileResult = ReturnType<typeof parseStoriesFile>;

export const parseTestProjectStories = () =>
  (
    [
      {
        glob: 'project/v6/src/**/*.stories.*',
        options: { useLooseStoryNameSemantics: true },
      },
      {
        glob: 'project/v7/src/**/*.*',
        options: { useLooseStoryNameSemantics: false },
      },
    ] satisfies {
      glob: string;
      options: CsfParseOptions;
    }[]
  )
    .flatMap((c) =>
      sync(c.glob, { cwd: testBaseDir }).map((match) => ({
        ...c,
        match,
      })),
    )
    .map(({ match, options }) => {
      const storiesPath = join(testBaseDir, match);
      const contents = readFileSync(storiesPath).toString();
      const parsedRaw = parseStoriesFile(contents, options, basename(match));

      return { file: match, parsedRaw };
    })
    .filter(
      (
        result,
      ): result is {
        file: string;
        parsedRaw: NonNullable<ParsedStoriesFileResult>;
      } => !!result.parsedRaw,
    );
