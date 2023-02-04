import type { Uri } from 'vscode';
import { StoryExplorerEntry } from '../story/StoryExplorerEntry';
import type { TreeNode } from '../tree/TreeNode';

export const getStoryFromCommandArgument = (
  item: TreeNode | StoryExplorerEntry | Uri,
) => {
  // Invoked via codelens
  if (item instanceof StoryExplorerEntry) {
    return item;
  }

  // Invoked via tree view
  if (typeof item === 'object' && 'type' in item) {
    return item.getEntry();
  }

  return undefined;
};
