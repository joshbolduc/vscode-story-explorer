import type { ExportNode, ImportNode, JsxNode, RootNode } from '@mdx-js/mdx';
import { sync } from '@mdx-js/mdx';
import { logWarn } from '../../log/log';

const jsxPrepend = '<>';
const jsxAppend = '</>;';

export const transformMdxForBabel = (contents: string) => {
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
      const value =
        node.type === 'jsx'
          ? `${jsxPrepend}${node.value}${jsxAppend}`
          : node.value;

      return { value, position: node.position };
    });

  return lines
    .reduce<string[]>((output, { value, position }) => {
      const line = output.length;
      const desiredLine = position.start.line - 1;

      for (let i = line; i < desiredLine; i++) {
        output.push('');
      }

      output.push(...value.split('\n'));

      return output;
    }, [])
    .join('\n');
};
