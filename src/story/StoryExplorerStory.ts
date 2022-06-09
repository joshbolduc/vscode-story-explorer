import { toId } from '@componentdriven/csf';
import { Range, ViewColumn } from 'vscode';
import type { Story } from '../parser/Story';
import type { Location } from '../types/Location';
import { createOpenInEditorCommand } from '../util/createOpenCommand';
import type { IconName } from '../util/getIconPath';
import { splitKind } from '../util/splitKind';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

const DOCS_ONLY_STORY_NAME = 'Page';

export class StoryExplorerStory {
  /**
   * The story's ID.
   */
  public readonly id: string;

  /**
   * The name of the story itself (excluding any kinds).
   */
  public readonly name: string;

  /**
   * The source location of the story's definition, if available.
   */
  public readonly location?: Location;

  /**
   * Whether this story is actually a docs entry.
   */
  public readonly isDocs: boolean;

  private constructor(
    private readonly story: Pick<
      StoryExplorerStory,
      'id' | 'name' | 'location' | 'isDocs'
    >,
    private readonly storyFile: StoryExplorerStoryFile,
  ) {
    this.id = story.id;
    this.name = story.name;
    this.location = story.location;
    this.isDocs = story.isDocs;
  }

  public static fromStoryFileForDocs(storyFile: StoryExplorerStoryFile) {
    const fileId = storyFile.getId();
    const title = storyFile.getTitle();

    if (typeof fileId !== 'string' || typeof title !== 'string') {
      return undefined;
    }

    const [nameFromTitle = ''] = splitKind(title).slice(-1);

    const name = storyFile.isDocsOnly() ? DOCS_ONLY_STORY_NAME : nameFromTitle;

    return new StoryExplorerStory(
      {
        id: storyFile.isDocsOnly() ? toId(fileId, name) : fileId,
        location: storyFile.getMetaLocation(),
        name,
        isDocs: true,
      },
      storyFile,
    );
  }

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
        isDocs: false,
      },
      storyFile,
    );
  }

  public getIconName(): IconName {
    if (this.isDocs) {
      return 'document';
    }

    return 'bookmark';
  }

  public getFile() {
    return this.storyFile;
  }

  public getOpenCommand(viewColumn?: ViewColumn) {
    const location = this.story.location;

    return createOpenInEditorCommand(this.storyFile.getUri(), {
      selection: location
        ? new Range(
            location.start.line - 1,
            location.start.column,
            location.start.line - 1,
            location.start.column,
          )
        : undefined,
      viewColumn,
    });
  }

  public getType() {
    return this.isDocs ? 'docs' : 'story';
  }
}
