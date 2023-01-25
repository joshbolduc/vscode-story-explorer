import {
  Disposable,
  ExtensionContext,
  ViewColumn,
  WebviewPanel,
  window,
} from 'vscode';
import { hostScriptPath } from '../../common/constants';
import { Message, MessageType } from '../../common/messaging';
import { webviewPreviewViewType } from '../constants/constants';
import { logDebug, logError, logInfo } from '../log/log';
import type { ProxyManager } from '../proxy/ProxyManager';
import type { ServerManager } from '../server/ServerManager';
import type { StoryStore } from '../store/StoryStore';
import type { StoryExplorerStory } from '../story/StoryExplorerStory';
import type { ValueOrPromise } from '../util/ValueOrPromise';
import { getIconPath } from '../util/getIconPath';
import { createMessenger, Messenger } from './createMessenger';
import webviewHtml from './webview.html';

export class StoryWebview {
  private readonly panel: WebviewPanel;
  private readonly messenger: Messenger;
  private readyListener?: Disposable | undefined;

  private constructor(
    story: StoryExplorerStory,
    context: ExtensionContext,
    proxyPort: number,
    serverManager: ServerManager,
    openToSide: boolean,
  );
  private constructor(
    story: StoryExplorerStory,
    context: ExtensionContext,
    proxyPort: number,
    serverManager: ServerManager,
    panel: WebviewPanel,
  );
  private constructor(
    private readonly story: StoryExplorerStory,
    private readonly context: ExtensionContext,
    private readonly proxyPort: number,
    private readonly serverManager: ServerManager,
    openToSideOrPanel: boolean | WebviewPanel,
  ) {
    this.panel =
      typeof openToSideOrPanel === 'boolean'
        ? window.createWebviewPanel(
            webviewPreviewViewType,
            'Story Explorer',
            {
              viewColumn: openToSideOrPanel
                ? ViewColumn.Beside
                : ViewColumn.Active,
              preserveFocus: false,
            },
            {
              enableScripts: true,
              retainContextWhenHidden: true,
              portMapping: [
                { extensionHostPort: proxyPort, webviewPort: proxyPort },
              ],
              enableCommandUris: true,
              localResourceRoots: [],
            },
          )
        : openToSideOrPanel;

    this.messenger = createMessenger(this.panel.webview);
  }

  public static async create(
    story: StoryExplorerStory,
    context: ExtensionContext,
    serverManager: ServerManager,
    proxyManager: ProxyManager,
    openToSide: boolean,
  ) {
    const proxyPort = await proxyManager.getProxyServerPort();

    const webview = new StoryWebview(
      story,
      context,
      proxyPort,
      serverManager,
      openToSide,
    );

    webview.init(proxyPort);

    return webview;
  }

  public static async deserialize(
    panel: WebviewPanel,
    state: { storyId: string } | undefined,
    context: ExtensionContext,
    serverManager: ServerManager,
    storyStore: StoryStore,
    proxyManager: ProxyManager,
  ) {
    const storyId = state?.storyId;
    if (!storyId) {
      logInfo(
        'Failed to restore webview panel: no story ID was present in serialized state',
        state,
      );
      return;
    }

    const initializedStore = await storyStore.waitUntilInitialized();
    const story = initializedStore.getStoryById(storyId);
    if (!story) {
      logInfo(
        'Failed to restore webview panel: story ID not found in story store',
        storyId,
      );
      return;
    }

    const proxyPort = await proxyManager.getProxyServerPort();

    const webview = new StoryWebview(
      story,
      context,
      proxyPort,
      serverManager,
      panel,
    );

    webview.init(proxyPort);

    return webview;
  }

  public getPanel() {
    return this.panel;
  }

  public setLoading(
    serverReadyPromise: NonNullable<ValueOrPromise<string | undefined>>,
    proxyPortPromise: ValueOrPromise<number>,
  ) {
    this.readyListener = this.panel.webview.onDidReceiveMessage(
      async (e: Message) => {
        logDebug('Webview host received message', e);

        const handleReady = async () => {
          try {
            await this.messenger.send({
              type: MessageType.SetStoryInfo,
              storyId: this.story.id,
              storyType: this.story.getType(),
            });

            const storybookUrl = await serverReadyPromise;
            const proxyPort = await proxyPortPromise;

            // undefined URL suggests server launch was canceled
            if (!storybookUrl) {
              logDebug('Closing webview in response to canceled launch');
              this.close();
              return;
            }

            logDebug(
              `Loading URL ${storybookUrl} in webview via proxy port ${proxyPort}`,
            );
            await this.finishLoading(storybookUrl, proxyPort);
          } catch (err) {
            logError('Failed to complete webview initialization', err);
            this.close();
          }
        };

        switch (e.type) {
          case MessageType.Ready:
            this.readyListener?.dispose();
            this.readyListener = undefined;

            await handleReady();
            break;
        }
      },
    );

    this.setWebviewHtml();
  }

  public close() {
    this.panel.dispose();
    this.readyListener?.dispose();
  }

  public dispose() {
    this.close();
  }

  public getStoryId() {
    return this.story.id;
  }

  private finishLoading(storybookUrl: string, proxyPort: number) {
    return this.messenger.send({
      type: MessageType.LoadStory,
      port: proxyPort,
      storybookUrl,
      isInternalServer: this.serverManager.isInternalServerEnabled(),
    });
  }

  private init(proxyPort: number) {
    const serverReadyPromise = Promise.resolve(
      this.serverManager.ensureServerHealthy(),
    );

    this.panel.title = this.story.label;

    this.panel.iconPath = {
      dark: getIconPath(this.story.getIconName(), this.context, 'dark'),
      light: getIconPath(this.story.getIconName(), this.context, 'light'),
    };

    this.setLoading(serverReadyPromise, proxyPort);
  }

  private setWebviewHtml() {
    const scriptPath = `http://localhost:${this.proxyPort}/${hostScriptPath}`;

    // Clearing the webview's contents seems to be necessary in order for
    // refreshing to work
    this.panel.webview.html = '';
    this.panel.webview.html = this.getWebviewHtml(scriptPath);
  }

  private getWebviewHtml(scriptPath: string): string {
    return webviewHtml.replace('{{entrypoint}}', scriptPath);
  }
}
