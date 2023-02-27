import type { AutodocsConfig } from '../config/autodocs';
import { logDebug } from '../log/log';
import type { StoryStore } from '../store/StoryStore';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
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
  storyStore: StoryStore,
  { autodocsConfig, showKindsWithoutChildren }: StoryFileToKindTreeOptions,
) => {
  if (storyFile.isAttachedDoc() && !storyFile.getDocs()?.getAttachedFile()) {
    logDebug(`Failed to attach docs for ${storyFile.getUri().toString()}`);
    return;
  }

  const kindParts = storyFile.getTitle();
  if (kindParts === undefined) {
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
      // No need to associate attached docs with the last node in the title;
      // leave it for the file it's attached to
      if (!storyFile.isAttachedDoc()) {
        kindTreeNode.files.push(storyFile);
      }

      if (autodocsConfig) {
        const docs = storyFile.getDocs();

        const attachedFiles = storyStore.getStoriesAttachedToUri(
          storyFile.getUri(),
        );

        // If there's an attached doc with the autodocs name, it replaces the
        // standard autodocs entry
        const autodocEntry =
          attachedFiles
            .find((file) => file.getDocs()?.name === autodocsConfig.defaultName)
            ?.getDocs() ?? docs;

        // Add an autodocs entry, if appropriate
        if (
          // Autodocs entry (automatic or attached) must exist
          autodocEntry &&
          // Skip if an entry with the expected autodocs ID has already been
          // added--e.g., it might be that an attached doc was already used to
          // replace the standard autodoc, or there are multiple autodocs (in
          // which case we just disregard the excess)
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
  storyStore: StoryStore,
  options: StoryFileToKindTreeOptions,
) => {
  const root: TreeNode[] = [];

  storyFiles.forEach((storyFile) => {
    addStoryFileToKindTree(root, storyFile, storyStore, options);
  });

  return root;
};
