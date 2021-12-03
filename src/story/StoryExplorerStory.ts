import { toId } from '@componentdriven/csf';
import { Range, ViewColumn } from 'vscode';
import type { Story } from '../parser/Story';
import type { Location } from '../types/Location';
import { createOpenInEditorCommand } from '../util/createOpenCommand';
import type { IconName } from '../util/getIconPath';
import { splitKind } from '../util/splitKind';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

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

  /**
   * The story portion of the ID, if not based on the story name. Used, e.g.,
   * for the export name for CSF stories and for MDX Story elements with a
   * `story` prop.
   */
  private readonly nameForId: string | undefined;

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
    const id = storyFile.getId();
    const title = storyFile.getTitle();

    if (typeof id !== 'string' || typeof title !== 'string') {
      return undefined;
    }

    const [name = ''] = splitKind(title).slice(-1);
    return new StoryExplorerStory(
      {
        id: storyFile.isDocsOnly() ? toId(id, 'page') : id,
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

    const storyIdPart = storyFile.isDocsOnly() ? 'page' : nameForId ?? name;

    return new StoryExplorerStory(
      { id: toId(fileId, storyIdPart), location, name, isDocs: false },
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
