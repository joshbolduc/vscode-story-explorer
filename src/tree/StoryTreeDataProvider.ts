import {
  Disposable,
  EventEmitter,
  ExtensionContext,
  TreeDataProvider,
  TreeItem,
} from 'vscode';
import { storiesViewShowItemsWithoutStoriesConfigSuffix } from '../constants/constants';
import type { StoryStore } from '../store/StoryStore';
import { SettingsWatcher } from '../util/SettingsWatcher';
import type { TreeNode } from './TreeNode';
import { TreeNodeItem } from './TreeNodeItem';
import { storyFilesToKindTree } from './storyFilesToKindTree';

const sortRootTreeNodes = (treeNodes: TreeNode[]) => {
  return treeNodes.sort((a, b) => {
    const shouldPrioritize = (node: TreeNode) => {
      // At the root, sort the node first if:
      // - it is a story itself
      // - it is a kind node being (strictly) treated as a story node
      // - it is a kind node with immediate story children
      return (
        node.type === 'story' ||
        node.getEffectiveStory(true) ||
        node.hasStoryChildren()
      );
    };

    if (shouldPrioritize(a) && !shouldPrioritize(b)) {
      return -1;
    }
    if (shouldPrioritize(b) && !shouldPrioritize(a)) {
      return 1;
    }

    return 0;
  });
};

export class StoryTreeDataProvider implements TreeDataProvider<TreeNode> {
  private readonly onDidChangeTreeDataEmitter = new EventEmitter<
    TreeNode | undefined | void
  >();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private readonly showItemsWithoutStoriesWatcher = new SettingsWatcher(
    storiesViewShowItemsWithoutStoriesConfigSuffix,
    () => {
      this.refreshAll();
    },
  );
  private readonly storyStoreListener: Disposable;

  public constructor(
    private readonly context: ExtensionContext,
    private readonly store: StoryStore,
  ) {
    this.storyStoreListener = store.onDidUpdateStoryStore(() => {
      this.refreshAll();
    });
  }

  public refreshAll() {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: TreeNode): TreeItem | Thenable<TreeItem> {
    return TreeNodeItem.fromTreeNode(element, this.context);
  }

  public getParent(element: TreeNode) {
    return element.parent;
  }

  public async getChildren(
    element?: TreeNode,
  ): Promise<TreeNode[] | undefined> {
    if (!element) {
      return this.getRootChildren();
    }

    return this.getElementChildren(element);
  }

  public dispose() {
    this.showItemsWithoutStoriesWatcher.dispose();
    this.storyStoreListener.dispose();
  }

  private getElementChildren(element: TreeNode) {
    return element.type === 'kind' ? element.getChildren() : undefined;
  }

  private async getRootChildren() {
    await this.store.waitUntilInitialized();

    const storyFiles = await this.store.getSortedStoryFiles();
    const showKindsWithoutChildren =
      this.showItemsWithoutStoriesWatcher.read() === true;
    const root = storyFilesToKindTree(storyFiles, showKindsWithoutChildren);

    return sortRootTreeNodes(root);
  }
}
