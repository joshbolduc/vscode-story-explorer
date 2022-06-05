import type { SourceLocation } from '@babel/types';

export const sourceLocationToLocation = (
  sourceLocation: SourceLocation | null | undefined,
) =>
  sourceLocation
    ? {
        start: {
          line: sourceLocation.start.line,
          column: sourceLocation.start.column,
        },
        end: {
          line: sourceLocation.end.line,
          column: sourceLocation.end.column,
        },
      }
    : undefined;
