import { logError, logWarn } from '../log/log';
import type { StoryExplorerStory } from '../story/StoryExplorerStory';
import type { TreeNode } from '../tree/TreeNode';
import type { WebviewManager } from '../webview/WebviewManager';
import { getStoryFromCommandArgument } from './getStoryFromCommandArgument';

export const openPreview = (
  webviewManager: WebviewManager,
  openToSide: boolean,
) => {
  return (item: TreeNode | StoryExplorerStory) => {
    if (!item) {
      logWarn('Failed to open preview: no argument provided');
      return;
    }

    const story = getStoryFromCommandArgument(item);
    if (!story) {
      logWarn('Failed to open preview: invalid argument', item);
      return;
    }

    webviewManager.openOrActivateWebview(story, openToSide).catch((e) => {
      logError('Failed to open/activate webview', e, story);
    });
  };
};
