import { commands, ViewColumn } from 'vscode';
import { logError, logWarn } from '../log/log';
import type { StoryStore } from '../store/StoryStore';
import type { WebviewManager } from '../webview/WebviewManager';

export const goToStorySource =
  (webviewManager: WebviewManager, storyStore: StoryStore) => async () => {
    const storyId = webviewManager.getLastActiveStoryId();
    if (!storyId) {
      logWarn('Failed to open story source: no active story ID');
      return;
    }

    const lastActiveStory = storyStore.getStoryById(storyId);
    if (!lastActiveStory) {
      logWarn('Failed to open story source: story not found in store', storyId);
      return;
    }

    const openCommand = lastActiveStory.getOpenCommand(ViewColumn.One);

    try {
      await commands.executeCommand(
        openCommand.command,
        ...openCommand.arguments,
      );
    } catch (e) {
      logError('Failed to open story source', e, storyId);
    }
  };
