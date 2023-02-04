import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import { splitKind } from '../util/splitKind';
import { KindTreeNode } from './KindTreeNode';
import { StoryTreeNode } from './StoryTreeNode';
import type { TreeNode } from './TreeNode';

const addStoryFileToKindTree = (
  rootChildren: TreeNode[],
  storyFile: StoryExplorerStoryFile,
  showKindsWithoutChildren: boolean,
) => {
  const kindName = storyFile.getTitle();

  if (typeof kindName !== 'string') {
    return;
  }

  const stories = storyFile.getStories();

  // Skip entire entry if there are no stories, unless it's a docs-only
  // story file or settings call for it to be included anyway.
  if (
    stories.length === 0 &&
    !storyFile.isDocsOnly() &&
    !showKindsWithoutChildren
  ) {
    return;
  }

  const kindParts = splitKind(kindName);

  let treeParent: KindTreeNode | undefined;

  kindParts.forEach((kindPart, i) => {
    const existingChild = (treeParent?.getChildren() ?? rootChildren).find(
      (item): item is KindTreeNode =>
        item.type === 'kind' && item.name === kindPart,
    );

    const kindTreeNode =
      existingChild ?? new KindTreeNode({ name: kindPart, parent: treeParent });

    if (!existingChild) {
      if (treeParent) {
        treeParent.addChild(kindTreeNode);
      } else {
        rootChildren.push(kindTreeNode);
      }
    }

    const isLeaf = i === kindParts.length - 1;
    if (isLeaf) {
      kindTreeNode.files.push(storyFile);

      stories.forEach((story) => {
        const node = new StoryTreeNode({
          name: story.name,
          parent: kindTreeNode,
          story,
          file: storyFile,
        });

        kindTreeNode.addChild(node);
      });
    }

    treeParent = kindTreeNode;
  });
};

export const storyFilesToKindTree = (
  storyFiles: StoryExplorerStoryFile[],
  showKindsWithoutChildren: boolean,
) => {
  const root: TreeNode[] = [];

  storyFiles.forEach((storyFile) => {
    addStoryFileToKindTree(root, storyFile, showKindsWithoutChildren);
  });

  return root;
};
