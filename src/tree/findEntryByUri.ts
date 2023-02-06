import type { Uri } from 'vscode';
import type { TreeNode } from './TreeNode';

export const findEntryByUri = (
  entries: Iterable<TreeNode>,
  uri: Uri,
): TreeNode | undefined => {
  for (const entry of entries) {
    if (entry.matchesUri(uri)) {
      return entry;
    }

    if (entry.type === 'kind') {
      const result = findEntryByUri(entry.getChildren(), uri);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
};
