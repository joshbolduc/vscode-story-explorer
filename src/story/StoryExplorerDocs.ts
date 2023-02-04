import { toId } from '@componentdriven/csf';
import { splitKind } from '../util/splitKind';
import { StoryExplorerEntry } from './StoryExplorerEntry';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

const DOCS_ONLY_STORY_NAME = 'Page';

export class StoryExplorerDocs extends StoryExplorerEntry {
  public readonly iconName = 'document';
  public readonly type = 'docs';

  public static fromStoryFileForDocs(storyFile: StoryExplorerStoryFile) {
    const fileId = storyFile.getId();
    const title = storyFile.getTitle();

    if (typeof fileId !== 'string' || typeof title !== 'string') {
      return undefined;
    }

    const [label = ''] = splitKind(title).slice(-1);

    const name = storyFile.isDocsOnly() ? DOCS_ONLY_STORY_NAME : label;

    return new StoryExplorerDocs(
      {
        id: storyFile.isDocsOnly() ? toId(fileId, name) : fileId,
        location: storyFile.getMetaLocation(),
        name,
      },
      storyFile,
      label,
    );
  }
}
