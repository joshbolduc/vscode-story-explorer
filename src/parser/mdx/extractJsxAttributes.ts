import type { NodePath } from '@babel/traverse';
import type { JSXElement } from '@babel/types';

const UNPARSED = Symbol('Unparsed value');

export const extractJsxAttributes = (path: NodePath<JSXElement>) => {
  const attributes = path.get('openingElement').get('attributes');
  const children = path.get('children');

  const mergedProps = attributes.reduce<{
    values: Record<string, unknown>;
    literals: Record<string, string>;
  }>(
    (acc, attr) => {
      if (attr.isJSXAttribute()) {
        const name = attr.node.name.name;

        if (typeof name === 'string') {
          const evalResult = attr.get('value').evaluate();
          if (evalResult.confident) {
            acc.values[name] = evalResult.value;
          } else {
            acc.values[name] = UNPARSED;
            const valuePath = attr.get('value');
            if (valuePath.isJSXExpressionContainer()) {
              acc.literals[name] = valuePath.get('expression').toString();
            }
          }
        }
      } else if (attr.isJSXSpreadAttribute()) {
        const evalResult = attr.get('argument').evaluate();

        if (evalResult.confident && typeof evalResult.value === 'object') {
          Object.assign(acc.values, evalResult.value);
        }
      }
      return acc;
    },
    { values: {}, literals: {} },
  );

  if (children.length > 0) {
    mergedProps.values.children = children;
  }

  return mergedProps;
};
