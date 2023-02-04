import {
  CancellationToken,
  CancellationTokenSource,
  ExtensionContext,
  TreeView,
  Uri,
  window,
} from 'vscode';
import { storyTreeViewId } from '../constants/constants';
import { logWarn } from '../log/log';
import type { StoryStore } from '../store/StoryStore';
import { StoryTreeDataProvider } from './StoryTreeDataProvider';
import type { TreeNode } from './TreeNode';
import { findEntryByUri } from './findEntryByUri';

const findEntryByStoryId = (
  nodes: Iterable<TreeNode>,
  storyId: string,
): TreeNode | undefined => {
  for (const node of nodes) {
    const entry = node.getLeafEntry();
    if (entry?.id === storyId) {
      return node;
    }

    if (node.type === 'kind') {
      const childNode = findEntryByStoryId(node.getChildren(), storyId);
      if (childNode) {
        return childNode;
      }
    }
  }

  return undefined;
};

export class TreeViewManager {
  private readonly provider: StoryTreeDataProvider;
  private readonly view: TreeView<TreeNode>;

  private activateCancellationTokenSource?: CancellationTokenSource;
  private readonly activeTextEditorWatcher = window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (editor) {
        const uri = editor.document.uri;
        this.activateCancellationTokenSource?.cancel();
        this.activateCancellationTokenSource = new CancellationTokenSource();
        try {
          await this.activateByUri(
            uri,
            this.activateCancellationTokenSource.token,
          );
        } catch (e) {
          logWarn('Failed to activate tree view item by uri', e, uri);
        }
      }
    },
  );

  private readonly activeColorThemeWatcher = window.onDidChangeActiveColorTheme(
    () => {
      this.refreshAll();
    },
  );

  private constructor(context: ExtensionContext, storyStore: StoryStore) {
    this.provider = new StoryTreeDataProvider(context, storyStore);

    this.view = window.createTreeView(storyTreeViewId, {
      treeDataProvider: this.provider,
      showCollapseAll: true,
    });
  }

  public static init(context: ExtensionContext, storyStore: StoryStore) {
    return new TreeViewManager(context, storyStore);
  }

  public refreshAll() {
    this.provider.refreshAll();
  }

  public async activateByStoryId(storyId: string) {
    const element = await this.getElementForStoryId(storyId);

    if (element) {
      return this.reveal(element);
    }
  }

  public async activateByUri(uri: Uri, token: CancellationToken) {
    const element = await this.getElementForUri(uri);

    if (!token.isCancellationRequested && element) {
      return this.reveal(element);
    }
  }

  public dispose() {
    this.view.dispose();
    this.activeTextEditorWatcher.dispose();
    this.activeColorThemeWatcher.dispose();
    this.provider.dispose();
    this.activateCancellationTokenSource?.dispose();
  }

  private async reveal(element: TreeNode) {
    if (!this.view.visible) {
      return;
    }

    const selection = this.view.selection;
    if (selection.length > 1) {
      return;
    }

    if (selection.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- known length 1
      const selectedItem = selection[0]!;

      // Skip if trying to reveal a story file whose child is already selected
      if (
        selectedItem.type === 'story' &&
        element.type === 'kind' &&
        element.matchesUri(selectedItem.file.getUri())
      ) {
        return;
      }
    }

    return this.view.reveal(element, { expand: true });
  }

  private async getElementForUri(uri: Uri): Promise<TreeNode | undefined> {
    const entries = await this.provider.getChildren();

    if (entries) {
      return findEntryByUri(entries, uri);
    }

    return undefined;
  }

  private async getElementForStoryId(
    storyId: string,
  ): Promise<TreeNode | undefined> {
    const entries = await this.provider.getChildren();

    if (entries) {
      return findEntryByStoryId(entries, storyId);
    }

    return undefined;
  }
}
