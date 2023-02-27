import { firstValueFrom } from 'rxjs';
import {
  Disposable,
  EventEmitter,
  ExtensionContext,
  TreeDataProvider,
  TreeItem,
} from 'vscode';
import { autodocsConfig } from '../config/autodocs';
import { storiesViewShowItemsWithoutStoriesConfigSuffix } from '../constants/constants';
import type { StoryStore } from '../store/StoryStore';
import { SettingsWatcher } from '../util/SettingsWatcher';
import type { TreeNode } from './TreeNode';
import { TreeNodeItem } from './TreeNodeItem';
import { storyFilesToKindTree } from './storyFilesToKindTree';

const sortRootTreeNodes = (treeNodes: readonly TreeNode[]) => {
  return treeNodes.slice().sort((a, b) => {
    const shouldPrioritize = (node: TreeNode) => {
      // At the root, sort the node first if:
      // - it is a story itself, or is a kind node being treated as a story node
      //   (i.e., a leaf)
      // - it is a kind node with immediate story children
      return (
        !!node.getLeafEntry() ||
        (node.type === 'kind' && node.hasStoryChildren())
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

  public async getChildren(element?: TreeNode) {
    if (!element) {
      return (await this.getRootChildren()).slice();
    }

    if (element.type === 'story') {
      return undefined;
    }

    return element.getChildren().slice();
  }

  public dispose() {
    this.showItemsWithoutStoriesWatcher.dispose();
    this.storyStoreListener.dispose();
  }

  private async getRootChildren(): Promise<readonly TreeNode[]> {
    await this.store.waitUntilInitialized();

    const storyFiles = await this.store.getSortedStoryFiles();
    const showKindsWithoutChildren =
      this.showItemsWithoutStoriesWatcher.read() === true;
    const autodocs = await firstValueFrom(autodocsConfig);
    const root = storyFilesToKindTree(storyFiles, this.store, {
      autodocsConfig: autodocs,
      showKindsWithoutChildren,
    });

    return sortRootTreeNodes(root);
  }
}
