import { tryParseCsf } from './csf/csf';
import { tryParseMdx } from './mdx/mdx';

const csfParser = { parser: tryParseCsf, type: 'csf' } as const;
const mdxParser = { parser: tryParseMdx, type: 'mdx' } as const;

const getParsers = (filePath?: string) => {
  if (filePath?.endsWith('.mdx') || filePath?.endsWith('.md')) {
    return [mdxParser];
  }

  return [csfParser];
};

export const parseStoriesFile = (contents: string, filePath?: string) => {
  const parsers = getParsers(filePath);

  for (const { parser, type } of parsers) {
    const parsed = parser(contents);
    if (
      parsed &&
      // .mdx files don't require a Meta tag or stories, but .stories.mdx files
      // need at least one
      (type !== 'mdx' ||
        parsed.meta.location !== undefined ||
        parsed.stories.length > 0 ||
        !filePath?.endsWith('.stories.mdx'))
    ) {
      return { ...parsed, type };
    }
  }

  return undefined;
};
