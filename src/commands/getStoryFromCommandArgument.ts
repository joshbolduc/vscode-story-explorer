import type { Uri } from 'vscode';
import { StoryExplorerStory } from '../story/StoryExplorerStory';
import type { TreeNode } from '../tree/TreeNode';

export const getStoryFromCommandArgument = (
  item: TreeNode | StoryExplorerStory | Uri,
) => {
  // Invoked via codelens
  if (item instanceof StoryExplorerStory) {
    return item;
  }

  // Invoked via tree view
  if (typeof item === 'object' && 'type' in item) {
    if (item.type === 'story') {
      return item.story;
    }
    return item.getEffectiveStory(false);
  }

  return undefined;
};
