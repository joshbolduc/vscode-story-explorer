import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import { isJSXIdentifier, JSXElement } from '@babel/types';
import type { Location } from '../../types/Location';
import { sourceLocationToLocation } from '../sourceLocationToLocation';
import { extractJsxAttributes } from './extractJsxAttributes';
import { transformMdxForBabel } from './transformMdxForBabel';

interface RawResult {
  meta: {
    location: Location | undefined;
    properties: {
      values?: Record<string, unknown>;
      literals?: Record<string, string>;
    };
  };
  stories: {
    location: Location | undefined;
    properties: {
      values: Record<string, unknown>;
      literals: Record<string, string>;
    };
  }[];
}

const getJSXElementInfo = (path: NodePath<JSXElement>) => {
  const location = sourceLocationToLocation(path.node.loc);

  return {
    properties: extractJsxAttributes(path),
    // Fudge the location to account for preprocessing before the source gets
    // sent to babel. For now, just pretend it's zero length.
    location: location
      ? {
          start: { line: location.start.line, column: 0 },
          end: { line: location.start.line, column: 0 },
        }
      : undefined,
  };
};

export const parseFromContents = (contents: string): RawResult | undefined => {
  const result: RawResult = {
    meta: {
      location: undefined,
      properties: {},
    },
    stories: [],
  };

  const combinedOutput = transformMdxForBabel(contents);

  if (!combinedOutput) {
    return undefined;
  }

  const parsedFile = parse(combinedOutput, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  });

  traverse(parsedFile, {
    JSXElement: (path) => {
      const { openingElement } = path.node;
      const { name } = openingElement;
      if (isJSXIdentifier(name)) {
        const isMeta = name.name === 'Meta';
        const isStory = name.name === 'Story';

        if (isMeta || isStory) {
          const { properties, location } = getJSXElementInfo(path);
          if (isMeta) {
            result.meta.properties = properties;
            result.meta.location = location;
          } else if (isStory) {
            result.stories.push({
              location,
              properties,
            });
          }
        }
      }
    },
  });

  return result;
};
