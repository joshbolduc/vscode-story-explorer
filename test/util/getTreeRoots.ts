import type { ExtensionContext } from 'vscode';
import { URI } from 'vscode-uri';
import type { StoryStore } from '../../src/store/StoryStore';
import { StoryTreeDataProvider } from '../../src/tree/StoryTreeDataProvider';
import type { TreeNode } from '../../src/tree/TreeNode';
import type { TreeNodeItem } from '../../src/tree/TreeNodeItem';
import { getTestStoryFiles, TestProjectVersion } from './getTestStoryFiles';

export interface TreeItemRepresentation {
  item: TreeNodeItem;
  treeNode: TreeNode;
  children?: TreeItemRepresentation[];
  isTreeItem: true;
}

export const getTreeRoots = async (
  version: TestProjectVersion,
  configPath: string,
) => {
  const storyFiles = await getTestStoryFiles(version, configPath, {
    defaultGlobsIncludesAllMdx: version === '7',
  });
  const mockContext = {
    extensionUri: URI.file('/mock/extension/root'),
  } as ExtensionContext;

  const mockStore = {
    getSortedStoryFiles: () => Promise.resolve(storyFiles),
    getStoriesAttachedToUri: (uri) =>
      storyFiles.filter(
        (storyFile) =>
          storyFile.getDocs()?.getAttachedFile()?.getUri().toString() ===
          uri.toString(),
      ),
    onDidUpdateStoryStore: () => ({
      dispose: () => {
        // no-op
      },
    }),
    waitUntilInitialized: () => Promise.resolve(mockStore),
  } as Partial<StoryStore> as StoryStore;

  const provider = new StoryTreeDataProvider(mockContext, mockStore);

  const nodeToTreeItem = async (
    node: TreeNode,
  ): Promise<TreeItemRepresentation> => {
    const childItems = (await provider.getChildren(node))?.map(nodeToTreeItem);

    return {
      item: await provider.getTreeItem(node),
      treeNode: node,
      ...(childItems &&
        childItems.length > 0 && {
          children: await Promise.all(childItems),
        }),
      isTreeItem: true,
    };
  };

  const rootChildren = await Promise.all(
    (await provider.getChildren())!.map(nodeToTreeItem),
  );
  return rootChildren;
};
