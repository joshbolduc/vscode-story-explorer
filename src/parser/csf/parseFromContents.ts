import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { Binding, NodePath } from '@babel/traverse';
import {
  ClassDeclaration,
  Expression,
  FunctionDeclaration,
  Identifier,
  isExportSpecifier,
  isIdentifier,
  isTSSatisfiesExpression,
  ObjectExpression,
  SourceLocation,
  TSDeclareFunction,
  VariableDeclarator,
} from '@babel/types';
import type { Location } from '../../types/Location';
import { sourceLocationToLocation } from '../sourceLocationToLocation';

interface RawMeta {
  id?: string;
  location: Location | undefined;
  properties: Record<string, unknown>;
  declared: boolean;
}

export interface RawStory {
  exportName: string;
  location: Location | undefined;
  properties: Record<string, unknown>;
}

interface RawResult {
  meta: RawMeta;
  stories: RawStory[];
}

const parseMetaObjectExpression = (
  objectExpression: NodePath<ObjectExpression>,
) => {
  return objectExpression
    .get('properties')
    .reduce<Record<string, unknown>>((acc, property) => {
      if (property.isObjectProperty()) {
        const key = property.node.key;
        const name = 'name' in key ? key.name : undefined;

        if (name) {
          const evalResult = property.get('value').evaluate();
          if (evalResult.confident) {
            acc[name] = evalResult.value;
          }
        }
      }
      return acc;
    }, {});
};

const createStory = (
  exportName: string,
  localName: string,
  location: SourceLocation | null | undefined,
  path: NodePath,
) => {
  const newStory: RawStory = {
    exportName,
    location: location
      ? {
          start: location.start,
          end: location.end,
        }
      : undefined,
    properties: {},
  };

  // find references
  const bindings = path.scope.getAllBindings() as Record<string, Binding>;
  const referencePaths = bindings[localName]?.referencePaths;
  referencePaths?.forEach((referencePath) => {
    if (
      !referencePath.isIdentifier() ||
      !referencePath.parentPath.isMemberExpression()
    ) {
      return;
    }

    const memberExpression = referencePath.parentPath;

    const memberProperty = memberExpression.node.property;

    if (!isIdentifier(memberProperty)) {
      return;
    }

    const propertyName = memberProperty.name;

    const assignmentExpression = memberExpression.parentPath;
    if (!assignmentExpression.isAssignmentExpression()) {
      return;
    }

    const right = assignmentExpression.get('right');

    const evalResult = right.evaluate();

    if (evalResult.confident) {
      newStory.properties[propertyName] = evalResult.value;
    }
  });

  return newStory;
};

const getNestedExpression = (
  node: NodePath<
    | ClassDeclaration
    | FunctionDeclaration
    | TSDeclareFunction
    | Expression
    | null
    | undefined
  >,
) => {
  let expr = node;

  while (expr.isTSAsExpression() || isTSSatisfiesExpression(expr.node)) {
    expr = expr.get('expression') as NodePath<Expression>;
  }

  return expr;
};

export const parseFromContents = (contents: string): RawResult => {
  const parsedFile = parse(contents, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  });

  const meta: RawMeta = {
    location: undefined,
    properties: {},
    declared: false,
  };
  const stories: RawStory[] = [];

  const addMetaObjectProperties = (
    properties: Record<string, unknown>,
    location: Location | undefined,
  ) => {
    meta.declared = true;
    Object.assign(meta.properties, properties);

    meta.location = location;
    if (typeof properties.id === 'string') {
      meta.id = properties.id;
    }
  };

  const addFromBinding = (expression: NodePath<Identifier>) => {
    const binding = expression.scope.getBinding(expression.node.name);
    const bindingPath = binding?.path;
    if (bindingPath?.isVariableDeclarator()) {
      const init = bindingPath.get('init');

      const nestedExpression = getNestedExpression(init);

      if (nestedExpression.isObjectExpression()) {
        const sourceLoc = bindingPath.node.loc;
        addMetaObjectProperties(
          parseMetaObjectExpression(nestedExpression),
          sourceLocationToLocation(sourceLoc),
        );
      }
    }
  };

  const createStoryFromDeclarationPath = (
    path: NodePath<FunctionDeclaration | VariableDeclarator>,
  ) => {
    const id = path.node.id;

    if (isIdentifier(id)) {
      const exportName = id.name;
      const location = id.loc;

      const newStory = createStory(exportName, exportName, location, path);
      stories.push(newStory);
    }
  };

  traverse(parsedFile, {
    ExportDefaultDeclaration: (path) => {
      const declaration = path.get('declaration');
      if (declaration.isObjectExpression()) {
        const sourceLoc = declaration.node.loc;
        addMetaObjectProperties(
          parseMetaObjectExpression(declaration),
          sourceLocationToLocation(sourceLoc),
        );
      } else if (declaration.isIdentifier()) {
        addFromBinding(declaration);
      } else if (
        declaration.isTSAsExpression() ||
        isTSSatisfiesExpression(declaration.node)
      ) {
        const expression = getNestedExpression(declaration);
        if (expression.isObjectExpression()) {
          const sourceLoc = declaration.node.loc;
          addMetaObjectProperties(
            parseMetaObjectExpression(expression),
            sourceLocationToLocation(sourceLoc),
          );
        } else if (expression.isIdentifier()) {
          addFromBinding(expression);
        }
      }
    },
    ExportNamedDeclaration: (path) => {
      path.node.specifiers.forEach((specifierNode) => {
        if (
          isExportSpecifier(specifierNode) &&
          isIdentifier(specifierNode.local) &&
          isIdentifier(specifierNode.exported)
        ) {
          const localIdentifier = specifierNode.local;
          const exportedIdentifier = specifierNode.exported;

          const bindings = path.scope.getAllBindings() as Record<
            string,
            Binding
          >;
          const binding = bindings[localIdentifier.name];
          const location = binding?.identifier.loc;
          const newStory = createStory(
            exportedIdentifier.name,
            localIdentifier.name,
            location,
            path,
          );
          stories.push(newStory);
        }
      });

      const declarationPath = path.get('declaration');
      if (declarationPath) {
        if (declarationPath.isFunctionDeclaration()) {
          createStoryFromDeclarationPath(declarationPath);
        } else if (declarationPath.isVariableDeclaration()) {
          declarationPath
            .get('declarations')
            .forEach((variableDeclarationPath) => {
              createStoryFromDeclarationPath(variableDeclarationPath);
            });
        }
      }
    },
  });

  return { meta, stories };
};
