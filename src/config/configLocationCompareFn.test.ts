import { URI, Utils } from 'vscode-uri';
import {
  ConfigLocation,
  configLocationCompareFn,
} from './configLocationCompareFn';

const configLocationFromFakePath = (path: string): ConfigLocation => ({
  dir: Utils.dirname(URI.file(path)),
  file: URI.file(path),
  relativePath: path,
});

describe('configLocationCompareFn', () => {
  it('prioritizes shallow paths over deep paths', () => {
    const candidates = [
      'very/deep/path/.storybook/main.js',
      'shallow/.storybook/main.js',
      'deep/path/.storybook/main.js',
    ].map(configLocationFromFakePath);

    expect(candidates.sort(configLocationCompareFn).map((p) => p.relativePath))
      .toMatchInlineSnapshot(`
      Array [
        "shallow/.storybook/main.js",
        "deep/path/.storybook/main.js",
        "very/deep/path/.storybook/main.js",
      ]
    `);
  });

  it('prioritizes shallow paths over deep paths regardless of extension', () => {
    const candidates = [
      'very/deep/path/.storybook/main.js',
      'shallow/.storybook/main.ts',
      'deep/path/.storybook/main.js',
    ].map(configLocationFromFakePath);

    expect(candidates.sort(configLocationCompareFn).map((p) => p.relativePath))
      .toMatchInlineSnapshot(`
      Array [
        "shallow/.storybook/main.ts",
        "deep/path/.storybook/main.js",
        "very/deep/path/.storybook/main.js",
      ]
    `);
  });

  it('prioritizes extensions in order', () => {
    const candidates = [
      '.storybook/main.cjs',
      '.storybook/main.cts',
      '.storybook/main.foo',
      '.storybook/main.js',
      '.storybook/main.jsx',
      '.storybook/main.mjs',
      '.storybook/main.mts',
      '.storybook/main.ts',
      '.storybook/main.tsx',
    ].map(configLocationFromFakePath);

    expect(candidates.sort(configLocationCompareFn).map((p) => p.relativePath))
      .toMatchInlineSnapshot(`
      Array [
        ".storybook/main.js",
        ".storybook/main.jsx",
        ".storybook/main.ts",
        ".storybook/main.tsx",
        ".storybook/main.cjs",
        ".storybook/main.mjs",
        ".storybook/main.cts",
        ".storybook/main.mts",
        ".storybook/main.foo",
      ]
    `);
  });
});
