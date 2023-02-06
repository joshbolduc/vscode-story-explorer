import { toId } from '@componentdriven/csf';
import type { AutodocsConfig } from '../config/autodocs';
import { splitKind } from '../util/splitKind';
import { StoryExplorerEntry } from './StoryExplorerEntry';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

const DOCS_ONLY_STORY_NAME_SB6_x = 'Page';

export class StoryExplorerDocs extends StoryExplorerEntry {
  public readonly iconName = 'document';
  public readonly type = 'docs';

  public static fromStoryFileForDocs(
    storyFile: StoryExplorerStoryFile,
    autodocsConfig: AutodocsConfig | undefined,
  ) {
    const fileId = storyFile.getId();
    const title = storyFile.getTitle();

    if (typeof fileId !== 'string' || typeof title !== 'string') {
      return undefined;
    }

    const [label = ''] = splitKind(title).slice(-1);

    const getDefaultName = () =>
      autodocsConfig ? autodocsConfig.defaultName : DOCS_ONLY_STORY_NAME_SB6_x;

    const name =
      autodocsConfig || storyFile.isDocsOnly() ? getDefaultName() : label;

    return new StoryExplorerDocs(
      {
        id:
          autodocsConfig || storyFile.isDocsOnly()
            ? toId(fileId, name)
            : fileId,
        location: storyFile.getMetaLocation(),
        name,
      },
      storyFile,
      label,
    );
  }
}
