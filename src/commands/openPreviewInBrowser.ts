import { env, Uri } from 'vscode';
import { logError } from '../log/log';
import type { ServerManager } from '../server/ServerManager';
import type { StoryStore } from '../store/StoryStore';
import type { StoryExplorerStory } from '../story/StoryExplorerStory';
import type { TreeNode } from '../tree/TreeNode';
import type { WebviewManager } from '../webview/WebviewManager';
import { getStoryFromCommandArgument } from './getStoryFromCommandArgument';

export const openPreviewInBrowser =
  (
    webviewManager: WebviewManager,
    storyStore: StoryStore,
    serverManager: ServerManager,
  ) =>
  async (item?: TreeNode | StoryExplorerStory | Uri) => {
    const getStory = () => {
      const commandResult = item
        ? getStoryFromCommandArgument(item)
        : undefined;
      if (commandResult) {
        return commandResult;
      }

      // Invoked via webview context menu
      const lastStoryId = webviewManager.getLastActiveStoryId();
      if (lastStoryId) {
        return storyStore.getStoryById(lastStoryId);
      }
    };

    const story = getStory();
    if (!story) {
      return;
    }

    const host = await serverManager.ensureServerHealthy();
    if (!host) {
      return;
    }

    const storyId = story.id;
    const uriToOpen = Uri.parse(host, true).with({
      query: storyId
        ? `path=/${story.getType()}/${encodeURIComponent(storyId)}`
        : undefined,
    });

    try {
      await env.openExternal(uriToOpen);
    } catch (e) {
      logError('Failed to open preview in browser', e, uriToOpen);
    }
  };
