import type { Config, Printer, Refs } from 'pretty-format';

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

export const addSerializer = <T>(serializer: Serializer<T>) => {
  expect.addSnapshotSerializer(serializer);
};
