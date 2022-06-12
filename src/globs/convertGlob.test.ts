import { URI } from 'vscode-uri';
import { convertGlob } from './convertGlob';

describe('convertGlob', () => {
  const inputs = [
    ['file.ts'],
    ['src/file.ts'],
    [
      'src/*',
      ['/mock/baseDir/src/file.ts'],
      ['/mock/baseDir/file.ts', '/mock/baseDir/src/nested/file.ts'],
    ],
    [
      'src/**',
      [
        '/mock/baseDir/src/file.ts',
        '/mock/baseDir/src/nested/file.ts',
        '/mock/baseDir/src/file.js',
      ],
      ['/mock/baseDir/file.ts'],
    ],
    [
      'src/**/*.ts',
      ['/mock/baseDir/src/file.ts', '/mock/baseDir/src/nested/file.ts'],
      ['/mock/baseDir/src/file.js', '/mock/baseDir/file.ts'],
    ],
    [
      '../src/**/*.stories.mdx',
      ['/mock/src/test.stories.mdx', '/mock/src/nested/test.stories.mdx'],
      [
        '/mock/baseDir/src/test.stories.mdx',
        '/mock/src/stories.mdx',
        '/mock/src/nested/test.stories.mdx.txt',
      ],
    ],
    [
      '../src/**/*.stories.@(js|jsx|ts|tsx)',
      [
        '/mock/src/test.stories.js',
        '/mock/src/test.stories.jsx',
        '/mock/src/test.stories.ts',
        '/mock/src/test.stories.tsx',
        '/mock/src/nested/test.stories.ts',
      ],
      [
        '/mock/baseDir/src/test.stories.ts',
        '/mock/src/stories.ts',
        '/mock/src/nested/test.stories.ts.txt',
      ],
    ],
    [
      '**/*.stories.@(js|jsx|ts|tsx)',
      [
        '/mock/baseDir/src/test.stories.js',
        '/mock/baseDir/src/test.stories.jsx',
        '/mock/baseDir/src/test.stories.ts',
        '/mock/baseDir/src/test.stories.tsx',
        '/mock/baseDir/src/nested/test.stories.ts',
      ],
      [
        '/mock/src/test.stories.ts',
        '/mock/src/stories.ts',
        '/mock/src/nested/test.stories.ts.txt',
      ],
    ],
    [
      '**',
      [
        '/mock/baseDir',
        '/mock/baseDir/anything',
        '/mock/baseDir/nested/anything',
      ],
      ['/mock/src'],
    ],
    [
      '**/*',
      ['/mock/baseDir/anything', '/mock/baseDir/nested/anything'],
      ['/mock/src', '/mock/baseDir'],
    ],
    [
      '@(js|jsx|ts|tsx)',
      [
        '/mock/baseDir/js',
        '/mock/baseDir/jsx',
        '/mock/baseDir/ts',
        '/mock/baseDir/tsx',
      ],
      [
        '/mock/baseDir/file.js',
        '/mock/src/file.js',
        '/mock/baseDir/nested/file.js',
      ],
    ],
    [
      '**/../*.ts',
      ['/mock/test.ts'],
      [
        '/mock/baseDir/test.ts',
        '/mock/baseDir/nested/test.ts',
        '/mock/src/test.ts',
      ],
    ],
  ] as const;

  inputs.forEach(([input, match = undefined, noMatch = undefined]) =>
    it(`handles ${input}`, () => {
      const { filter, ...result } = convertGlob({
        directory: URI.file('/mock/baseDir'),
        files: input,
        titlePrefix: '',
      });

      if (!match) {
        expect(filter).toBeUndefined();
      } else {
        expect(typeof filter).toBe('function');
      }

      (match ?? []).forEach((path) => {
        expect(filter!(URI.file(path))).toBe(true);
      });
      (noMatch ?? []).forEach((path) => {
        expect(filter!(URI.file(path))).toBe(false);
      });

      const normalizedResult = {
        ...result,
        globBase: result.globBase.toString(),
      };

      expect(normalizedResult).toMatchSnapshot();
    }),
  );
});
