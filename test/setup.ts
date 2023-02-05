import { vi } from 'vitest';
import { isLocation } from '../src/util/guards/isLocation';
import { isPosition } from '../src/util/guards/isPosition';
import { addSerializer } from './util/addSerializer';

vi.mock('vscode');

addSerializer({
  test: isPosition,
  serialize: (v) => `[Ln ${v.line}, Col ${v.column}]`,
});

addSerializer({
  test: isLocation,
  serialize: (v, config, indentation, depth, refs, printer) => {
    const startStr = printer(v.start, config, indentation, depth, refs);

    if (v.start.line === v.end.line && v.start.column === v.end.column) {
      return startStr;
    }

    return `${startStr} - ${printer(v.end, config, indentation, depth, refs)}`;
  },
});
