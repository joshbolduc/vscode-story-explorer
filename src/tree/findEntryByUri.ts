import type { Uri } from 'vscode';
import type { TreeNode } from './TreeNode';

export const findEntryByUri = (
  entries: Iterable<TreeNode>,
  uri: Uri,
): TreeNode | undefined => {
  for (const entry of entries) {
    if (entry.type === 'kind') {
      if (entry.matchesUri(uri)) {
        return entry;
      }

      const result = findEntryByUri(entry.getChildren(), uri);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
};
