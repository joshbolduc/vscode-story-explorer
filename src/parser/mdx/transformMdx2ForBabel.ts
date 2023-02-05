import { compileSync } from '@mdx-js/mdx-2';
import type { Root } from 'mdast';
import type { MdxjsEsm, MdxJsxFlowElement } from 'mdast-util-mdx';
import { logWarn } from '../../log/log';
import { linesToSource } from './linesToSource';
import { wrapInJsx } from './wrapInJsx';

export const transformMdx2ForBabel = (contents: string) => {
  let ast: Root | undefined;

  compileSync(contents, {
    remarkPlugins: [
      () => (tree: Root) => {
        ast = tree;
        return tree;
      },
    ],
  });

  if (!ast) {
    logWarn('Failed to get AST from MDX content');
    return undefined;
  }

  const lines = ast.children
    .filter((node): node is MdxjsEsm | MdxJsxFlowElement =>
      ['mdxjsEsm', 'mdxJsxFlowElement'].includes(node.type),
    )
    .map((node) => {
      if (node.type === 'mdxJsxFlowElement') {
        const value = contents.substring(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- position expected to exist
          node.position!.start.offset!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- position expected to exist
          node.position!.end.offset,
        );

        return {
          value: wrapInJsx(value),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- position expected to exist
          position: node.position!,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- position expected to exist
      return { value: node.value, position: node.position! };
    });

  return linesToSource(lines);
};
