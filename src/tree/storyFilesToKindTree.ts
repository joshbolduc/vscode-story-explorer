import type { AutodocsConfig } from '../config/autodocs';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import { splitKind } from '../util/splitKind';
import { KindTreeNode } from './KindTreeNode';
import { StoryTreeNode } from './StoryTreeNode';
import type { TreeNode } from './TreeNode';

interface StoryFileToKindTreeOptions {
  autodocsConfig: AutodocsConfig | undefined;
  showKindsWithoutChildren: boolean;
}

const addStoryFileToKindTree = (
  rootChildren: TreeNode[],
  storyFile: StoryExplorerStoryFile,
  { autodocsConfig, showKindsWithoutChildren }: StoryFileToKindTreeOptions,
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
      existingChild ??
      new KindTreeNode(
        { name: kindPart, parent: treeParent },
        { showAutodocsAsChildren: !!autodocsConfig },
      );

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

      if (autodocsConfig) {
        const autodocEntry = storyFile.getDocs();

        // Add an autodocs entry, if appropriate
        if (
          // Autodocs entry must exist
          autodocEntry &&
          // Skip if an entry with the expected autodocs ID has already been
          // added--e.g., it might be that there are multiple autodocs (in which
          // case we just disregard the excess)
          !kindTreeNode
            .getChildren()
            .some((child) => child.getLeafEntry()?.id === autodocEntry.id)
        ) {
          kindTreeNode.addChild(
            new StoryTreeNode({
              name: autodocEntry.name,
              parent: kindTreeNode,
              story: autodocEntry,
              file: storyFile,
            }),
          );
        }
      }
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
  options: StoryFileToKindTreeOptions,
) => {
  const root: TreeNode[] = [];

  storyFiles.forEach((storyFile) => {
    addStoryFileToKindTree(root, storyFile, options);
  });

  return root;
};
