import { Uri } from 'vscode';
import { findFirstExistingFile } from './findFirstExistingFile';
import { getUriAndParentUris } from './getUriAndParentUris';

export const findClosestFile = (
  filenames: readonly string[],
  startingDir: Uri,
) =>
  findFirstExistingFile(
    getUriAndParentUris(startingDir).flatMap((dir) =>
      filenames.map((filename) => Uri.joinPath(dir, filename)),
    ),
  );
