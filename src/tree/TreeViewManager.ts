import {
  CancellationToken,
  CancellationTokenSource,
  Disposable,
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

const findEntryByUri = (
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

const findEntryByStoryId = (
  entries: Iterable<TreeNode>,
  storyId: string,
): TreeNode | undefined => {
  for (const entry of entries) {
    if (entry.type === 'story') {
      if (entry.story?.id === storyId) {
        return entry;
      }
    } else {
      const effectiveStory = entry.getEffectiveStory(true);
      if (effectiveStory?.id === storyId) {
        return entry;
      }

      const result = findEntryByStoryId(entry.getChildren(), storyId);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
};

export class TreeViewManager {
  private readonly provider: StoryTreeDataProvider;
  private readonly view: TreeView<TreeNode>;
  private readonly storeListener: Disposable;

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

    this.storeListener = storyStore.onDidUpdateStoryStore(() => {
      this.provider.refreshAll();
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
    this.storeListener.dispose();
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
        element.matchesUri(selectedItem.story.getFile().getUri())
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
