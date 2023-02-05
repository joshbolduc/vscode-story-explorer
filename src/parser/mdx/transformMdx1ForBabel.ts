import type { ExportNode, ImportNode, JsxNode, RootNode } from '@mdx-js/mdx';
import { sync } from '@mdx-js/mdx';
import { logWarn } from '../../log/log';
import { linesToSource } from './linesToSource';
import { wrapInJsx } from './wrapInJsx';

export const transformMdx1ForBabel = (contents: string) => {
  let ast: RootNode | undefined;

  sync(contents, {
    remarkPlugins: [
      () => (tree: RootNode) => {
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
    .filter((node): node is JsxNode | ImportNode | ExportNode =>
      ['jsx', 'import', 'export'].includes(node.type),
    )
    .map((node) => {
      const value = node.type === 'jsx' ? wrapInJsx(node.value) : node.value;

      return { value, position: node.position };
    });

  return linesToSource(lines);
};
