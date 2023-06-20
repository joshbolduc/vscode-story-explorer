import type { Subscription } from 'rxjs';
import type { Disposable, ExtensionContext } from 'vscode';

import { commands } from 'vscode';
import { CodeLensManager } from './codelens/CodeLensManager';
import { goToStorySource } from './commands/goToStorySource';
import { openOutputChannel } from './commands/openOutputChannel';
import { openPreview } from './commands/openPreview';
import { openPreviewInBrowser } from './commands/openPreviewInBrowser';
import { openStoriesGlobsSetting } from './commands/openStoriesGlobsSetting';
import { openStorybookConfig } from './commands/openStorybookConfig';
import { openStorybookConfigDirSetting } from './commands/openStorybookConfigDirSetting';
import { openStorybookInBrowser } from './commands/openStorybookInBrowser';
import { openStorybookUrlSetting } from './commands/openStorybookUrlSetting';
import { refreshAllWebviews } from './commands/refreshAllWebviews';
import { refreshStories } from './commands/refreshStories';
import { refreshWebview } from './commands/refreshWebview';
import { restartStorybookServer } from './commands/restartStorybookServer';
import { startStorybookServer } from './commands/startStorybookServer';
import { stopStorybookServer } from './commands/stopStorybookServer';
import { IdCompletionManager } from './completion/IdCompletionManager';
import { TitleCompletionManager } from './completion/TitleCompletionManager';
import { storybookConfigLocation } from './config/storybookConfigLocation';
import {
  goToStorySourceCommand,
  openOutputChannelCommand,
  openPreviewCommand,
  openPreviewInBrowserCommand,
  openPreviewToSideCommand,
  openStoriesGlobsSettingCommand,
  openStorybookConfigCommand,
  openStorybookConfigDirSettingCommand,
  openStorybookInBrowserCommand,
  openStorybookUrlSettingCommand,
  refreshAllWebviewsCommand,
  refreshStoriesCommand,
  refreshWebviewCommand,
  restartStorybookServerCommand,
  startStorybookServerCommand,
  stopStorybookServerCommand,
} from './constants/constants';
import { initLogger, logError, logInfo } from './log/log';
import { ProxyManager } from './proxy/ProxyManager';
import { ServerManager } from './server/ServerManager';
import { StoryStore } from './store/StoryStore';
import { TreeViewManager } from './tree/TreeViewManager';
import { WebviewManager } from './webview/WebviewManager';

export const activate = async (context: ExtensionContext) => {
  const addSubscription = <T extends Disposable>(item: T) => {
    context.subscriptions.push(item);
    return item;
  };

  const addObservableSubscription = (subscription: Subscription) => {
    return {
      dispose: () => {
        subscription.unsubscribe();
      },
    };
  };

  addSubscription(initLogger(context.extensionMode));

  logInfo('Starting extension activation');

  const registerCommand = (
    ...args: Parameters<(typeof commands)['registerCommand']>
  ) => {
    addSubscription(commands.registerCommand(...args));
  };

  try {
    const serverManager = addSubscription(await ServerManager.init());
    const storyStore = addSubscription(await StoryStore.init());

    const treeViewManager = addSubscription(
      TreeViewManager.init(context, storyStore),
    );
    const proxyManager = addSubscription(
      ProxyManager.init(serverManager, context.extensionUri),
    );
    const webviewManager = addSubscription(
      WebviewManager.init(
        context,
        treeViewManager,
        serverManager,
        storyStore,
        proxyManager,
      ),
    );

    addObservableSubscription(storybookConfigLocation.subscribe());

    addSubscription(CodeLensManager.init(storyStore));
    addSubscription(TitleCompletionManager.init(storyStore));
    addSubscription(IdCompletionManager.init(storyStore));

    registerCommand(openPreviewCommand, openPreview(webviewManager, false));
    registerCommand(
      openPreviewToSideCommand,
      openPreview(webviewManager, true),
    );
    registerCommand(refreshStoriesCommand, refreshStories(storyStore));
    registerCommand(refreshWebviewCommand, refreshWebview(webviewManager));
    registerCommand(
      refreshAllWebviewsCommand,
      refreshAllWebviews(webviewManager),
    );
    registerCommand(
      goToStorySourceCommand,
      goToStorySource(webviewManager, storyStore),
    );
    registerCommand(
      openStorybookInBrowserCommand,
      openStorybookInBrowser(serverManager),
    );
    registerCommand(
      openPreviewInBrowserCommand,
      openPreviewInBrowser(webviewManager, storyStore, serverManager),
    );
    registerCommand(
      openStorybookConfigDirSettingCommand,
      openStorybookConfigDirSetting(),
    );
    registerCommand(openStoriesGlobsSettingCommand, openStoriesGlobsSetting());
    registerCommand(openStorybookUrlSettingCommand, openStorybookUrlSetting());
    registerCommand(openStorybookConfigCommand, openStorybookConfig());
    registerCommand(openOutputChannelCommand, openOutputChannel()),
      registerCommand(
        startStorybookServerCommand,
        startStorybookServer(serverManager),
      );
    registerCommand(
      stopStorybookServerCommand,
      stopStorybookServer(serverManager),
    );
    registerCommand(
      restartStorybookServerCommand,
      restartStorybookServer(serverManager),
    );
  } catch (e) {
    logError('Failed to activate Story Explorer extension', e);
  }

  logInfo('Completed extension activation');
};
