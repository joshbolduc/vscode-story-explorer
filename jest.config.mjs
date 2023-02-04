import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default /**
 * @type import('jest').Config
 */ ({
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text'],
  moduleNameMapper: {
    '^vscode$': join(__dirname, 'vscode.js'),
  },
  reporters: ['default', 'github-actions'],
  roots: ['src', 'test'],
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
});
