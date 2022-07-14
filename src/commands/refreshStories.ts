import { logError } from '../log/log';
import type { StoryStore } from '../store/StoryStore';

export const refreshStories = (storyStore: StoryStore) => async () => {
  try {
    await storyStore.refreshAll();
  } catch (e) {
    logError('Failed to refresh story store', e);
  }
};
