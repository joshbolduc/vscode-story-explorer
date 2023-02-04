import type { Config, Printer, Refs } from 'pretty-format';
import { isLocation } from '../src/util/guards/isLocation';
import { isPosition } from '../src/util/guards/isPosition';

interface Serializer<T> {
  test: (v: unknown) => v is T;
  serialize: (
    val: T,
    config: Config,
    indentation: string,
    depth: number,
    refs: Refs,
    printer: Printer,
  ) => string;
}

const addSerializer = <T>(serializer: Serializer<T>) => {
  expect.addSnapshotSerializer(serializer);
};

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
