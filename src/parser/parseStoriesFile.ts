import { tryParseCsf } from './csf/csf';
import { tryParseMdx } from './mdx/mdx';

const csfParser = { parser: tryParseCsf, type: 'csf' } as const;
const mdxParser = { parser: tryParseMdx, type: 'mdx' } as const;

const getParsers = (filePath?: string) => {
  if (filePath?.endsWith('.mdx') || filePath?.endsWith('.md')) {
    return [mdxParser, csfParser];
  }

  return [csfParser, mdxParser];
};

export const parseStoriesFile = (contents: string, filePath?: string) => {
  const parsers = getParsers(filePath);

  for (const { parser, type } of parsers) {
    const parsed = parser(contents);
    if (parsed) {
      return { ...parsed, type };
    }
  }

  return undefined;
};
