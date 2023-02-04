import { toId } from '@componentdriven/csf';
import type { Story } from '../parser/Story';
import { StoryExplorerEntry } from './StoryExplorerEntry';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

export class StoryExplorerStory extends StoryExplorerEntry {
  public readonly iconName = 'bookmark';
  public readonly type = 'story';

  public static fromStory(
    { nameForId, location, name }: Story,
    storyFile: StoryExplorerStoryFile,
  ) {
    const fileId = storyFile.getId();

    if (!fileId) {
      return undefined;
    }

    return new StoryExplorerStory(
      {
        id: toId(fileId, nameForId ?? name),
        location,
        name,
      },
      storyFile,
      name,
    );
  }
}
