import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default /**
 * @type import('@jest/types').Config.InitialOptions
 */ ({
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text'],
  moduleNameMapper: {
    '^vscode$': join(__dirname, 'vscode.js'),
  },
  roots: ['src'],
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
});
