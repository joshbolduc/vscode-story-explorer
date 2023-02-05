import { expect } from 'vitest';

type Plugin = Parameters<(typeof expect)['addSnapshotSerializer']>[0];

const typeInferenceFn = (plugin: Plugin) => {
  if ('serialize' in plugin) {
    return plugin.serialize;
  }
  throw new Error();
};
type Serialize = ReturnType<typeof typeInferenceFn>;
type SerializeParams = Parameters<Serialize>;

interface Serializer<T> {
  test: (v: unknown) => v is T;
  serialize: (
    val: T,
    config: SerializeParams[1],
    indentation: SerializeParams[2],
    depth: SerializeParams[3],
    refs: SerializeParams[4],
    printer: SerializeParams[5],
  ) => string;
}

export const addSerializer = <T>(serializer: Serializer<T>) => {
  expect.addSnapshotSerializer(serializer);
};
