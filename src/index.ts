import type { ExtensionContext } from 'vscode';

import { commands, Disposable } from 'vscode';
import { CodeLensManager } from './codelens/CodeLensManager';
import { goToStorySource } from './commands/goToStorySource';
import { openPreview } from './commands/openPreview';
import { openPreviewInBrowser } from './commands/openPreviewInBrowser';
import { openStorybookConfig } from './commands/openStorybookConfig';
import { openStorybookConfigDirSetting } from './commands/openStorybookConfigDirSetting';
import { openStorybookInBrowser } from './commands/openStorybookInBrowser';
import { openStorybookUrlSetting } from './commands/openStorybookUrlSetting';
import { refreshAllWebviews } from './commands/refreshAllWebviews';
import { refreshWebview } from './commands/refreshWebview';
import { restartStorybookServer } from './commands/restartStorybookServer';
import { startStorybookServer } from './commands/startStorybookServer';
import { stopStorybookServer } from './commands/stopStorybookServer';
import { IdCompletionManager } from './completion/IdCompletionManager';
import { TitleCompletionManager } from './completion/TitleCompletionManager';
import { ConfigManager } from './config/ConfigManager';
import {
  goToStorySourceCommand,
  openPreviewCommand,
  openPreviewInBrowserCommand,
  openPreviewToSideCommand,
  openStorybookConfigCommand,
  openStorybookConfigDirSettingCommand,
  openStorybookInBrowserCommand,
  openStorybookUrlSettingCommand,
  refreshAllWebviewsCommand,
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
  initLogger(context.extensionMode);

  logInfo('Starting extension activation');

  const addSubscription = <T extends Disposable>(item: T) => {
    context.subscriptions.push(item);
    return item;
  };

  const registerCommand = (
    ...args: Parameters<typeof commands['registerCommand']>
  ) => {
    addSubscription(commands.registerCommand(...args));
  };

  try {
    const configManager = addSubscription(await ConfigManager.init());
    const serverManager = addSubscription(
      await ServerManager.init(configManager),
    );
    const storyStore = addSubscription(await StoryStore.init(configManager));

    const treeViewManager = addSubscription(
      TreeViewManager.init(context, storyStore),
    );
    const proxyManager = addSubscription(ProxyManager.init(serverManager));
    const webviewManager = addSubscription(
      WebviewManager.init(
        context,
        treeViewManager,
        serverManager,
        storyStore,
        proxyManager,
      ),
    );

    addSubscription(CodeLensManager.init(storyStore, configManager));
    addSubscription(TitleCompletionManager.init(storyStore));
    addSubscription(IdCompletionManager.init(storyStore));

    registerCommand(openPreviewCommand, openPreview(webviewManager, false));
    registerCommand(
      openPreviewToSideCommand,
      openPreview(webviewManager, true),
    );
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
    registerCommand(openStorybookUrlSettingCommand, openStorybookUrlSetting());
    registerCommand(
      openStorybookConfigDirSettingCommand,
      openStorybookConfigDirSetting(),
    );
    registerCommand(
      openStorybookConfigCommand,
      openStorybookConfig(configManager),
    );
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
