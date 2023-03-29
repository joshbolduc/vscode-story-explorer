import type { NodePath } from '@babel/traverse';
import type { JSXElement } from '@babel/types';
import type { PropertyInfo } from '../PropertyInfo';
import { assignProperties } from '../csf/assignProperties';

const UNPARSED = Symbol('Unparsed value');

export const extractJsxAttributes = (path: NodePath<JSXElement>) => {
  const attributes = path.get('openingElement').get('attributes');
  const children = path.get('children');

  const mergedProps = attributes.reduce<{
    values: Record<string, PropertyInfo>;
    literals: Record<string, string>;
  }>(
    (acc, attr) => {
      if (attr.isJSXAttribute()) {
        const name = attr.node.name.name;

        if (typeof name === 'string') {
          const evalResult = attr.get('value').evaluate();
          if (evalResult.confident) {
            acc.values[name] = {
              isPartOfDeclaration: true,
              value: evalResult.value,
            };
          } else {
            acc.values[name] = {
              isPartOfDeclaration: true,
              value: UNPARSED,
            };
            const valuePath = attr.get('value');
            if (valuePath.isJSXExpressionContainer()) {
              acc.literals[name] = valuePath.get('expression').toString();
            }
          }
        }
      } else if (attr.isJSXSpreadAttribute()) {
        const evalResult = attr.get('argument').evaluate();
        const value = evalResult.value as unknown;

        if (evalResult.confident && value && typeof value === 'object') {
          assignProperties(acc.values, value);
        }
      }
      return acc;
    },
    { values: {}, literals: {} },
  );

  if (children.length > 0) {
    mergedProps.values.children = {
      isPartOfDeclaration: true,
      value: children,
    };
  }

  return mergedProps;
};
