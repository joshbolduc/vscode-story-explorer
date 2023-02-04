import {
  Disposable,
  ExtensionContext,
  WebviewPanelSerializer,
  window,
} from 'vscode';
import {
  storybookWebviewsOpenContext,
  webviewPreviewViewType,
} from '../constants/constants';
import { logDebug, logError, logInfo } from '../log/log';
import type { ProxyManager } from '../proxy/ProxyManager';
import type { ServerManager } from '../server/ServerManager';
import type { StoryStore } from '../store/StoryStore';
import type { StoryExplorerEntry } from '../story/StoryExplorerEntry';
import type { TreeViewManager } from '../tree/TreeViewManager';
import { setContext } from '../util/setContext';
import { StoryWebview } from './StoryWebview';
import { setStorybookPreviewFocused } from './setStorybookPreviewFocused';

export class WebviewManager {
  private readonly storyIdToWebviewMap = new Map<string, StoryWebview>();
  private lastActiveStoryId?: string | undefined;
  private panelViewStateChangeListener?: Disposable | undefined;
  private panelDisposeListener?: Disposable | undefined;
  private readonly deserializerListener: Disposable;

  private readonly webviewPanelSerializer: WebviewPanelSerializer<
    { storyId: string } | undefined
  > = {
    deserializeWebviewPanel: async (webviewPanel, state) => {
      logDebug('Got request to restore webview panel', webviewPanel, state);

      const webview = await StoryWebview.deserialize(
        webviewPanel,
        state,
        this.context,
        this.serverManager,
        this.storyStore,
        this.proxyManager,
      );

      if (webview) {
        this.add(webview);
      } else {
        logInfo(
          'Unable to deserialize restored webview panel; disposing orphaned panel',
          webviewPanel,
          state,
        );
        webviewPanel.dispose();
      }
    },
  };

  private constructor(
    private readonly context: ExtensionContext,
    private readonly treeView: TreeViewManager,
    private readonly serverManager: ServerManager,
    private readonly storyStore: StoryStore,
    private readonly proxyManager: ProxyManager,
  ) {
    this.deserializerListener = window.registerWebviewPanelSerializer(
      webviewPreviewViewType,
      this.webviewPanelSerializer,
    );
  }

  public static init(
    context: ExtensionContext,
    treeView: TreeViewManager,
    server: ServerManager,
    storyStore: StoryStore,
    proxyManager: ProxyManager,
  ) {
    return new WebviewManager(
      context,
      treeView,
      server,
      storyStore,
      proxyManager,
    );
  }

  public async openOrActivateWebview(
    story: StoryExplorerEntry,
    openToSide: boolean,
  ) {
    const id = story.id;
    const existingWebview = this.getPanel(id);

    if (existingWebview) {
      existingWebview.getPanel().reveal();
      return;
    }

    const newWebview = await StoryWebview.create(
      story,
      this.context,
      this.serverManager,
      this.proxyManager,
      openToSide,
    );

    this.addPanel(id, newWebview);
  }

  public add(webview: StoryWebview) {
    this.addPanel(webview.getStoryId(), webview);
  }

  public getLastActiveStoryId() {
    return this.lastActiveStoryId;
  }

  public getByStoryId(storyId: string) {
    return this.storyIdToWebviewMap.get(storyId);
  }

  public refreshWebview(storyId: string) {
    const webview = this.getByStoryId(storyId);
    if (!webview) {
      return;
    }

    return this.refreshWebviews([webview]);
  }

  public refreshAllWebviews() {
    return this.refreshWebviews(this.storyIdToWebviewMap.values());
  }

  public dispose() {
    for (const webview of this.storyIdToWebviewMap.values()) {
      webview.dispose();
    }

    this.panelDisposeListener?.dispose();
    this.panelViewStateChangeListener?.dispose();
    this.deserializerListener.dispose();
  }

  private refreshWebviews(webviews: Iterable<StoryWebview>) {
    const serverPromise = this.serverManager.ensureServerHealthy();
    const proxyPortPromise = this.proxyManager.getProxyServerPort();

    for (const webview of webviews) {
      webview.setLoading(serverPromise, proxyPortPromise);
    }
  }

  private addPanel(id: string, webview: StoryWebview) {
    this.storyIdToWebviewMap.set(id, webview);

    this.panelViewStateChangeListener = webview
      .getPanel()
      .onDidChangeViewState(({ webviewPanel }) => {
        const storyId = webview.getStoryId();
        if (webviewPanel.active) {
          this.setLastActiveStoryId(storyId);
          setStorybookPreviewFocused(true);

          this.treeView.activateByStoryId(storyId).catch((e) => {
            logError(
              'Failed to activate corresponding storyId in response to panel state change',
              e,
              storyId,
              webviewPanel.active,
            );
          });
        } else if (this.lastActiveStoryId === storyId) {
          setStorybookPreviewFocused(false);
        }
      });

    this.panelDisposeListener = webview.getPanel().onDidDispose(() => {
      if (this.lastActiveStoryId === webview.getStoryId()) {
        setStorybookPreviewFocused(false);
      }

      this.removePanel(id);
    });

    setContext(storybookWebviewsOpenContext, true);
  }

  private setLastActiveStoryId(storyId: string) {
    this.lastActiveStoryId = storyId;
  }

  private removePanel(id: string) {
    this.storyIdToWebviewMap.delete(id);

    if (this.lastActiveStoryId === id) {
      this.lastActiveStoryId = undefined;
    }

    if (this.storyIdToWebviewMap.size === 0) {
      setContext(storybookWebviewsOpenContext, false);
    }
  }

  private getPanel(id: string) {
    return this.storyIdToWebviewMap.get(id);
  }
}
