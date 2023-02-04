import { Range, ViewColumn } from 'vscode';
import type { Location } from '../types/Location';
import { createOpenInEditorCommand } from '../util/createOpenCommand';
import type { IconName } from '../util/getIconPath';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

export abstract class StoryExplorerEntry {
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
  public readonly location?: Location | undefined;

  public abstract readonly iconName: IconName;

  public abstract readonly type: 'story' | 'docs';

  protected constructor(
    story: Pick<StoryExplorerEntry, 'id' | 'name' | 'location'>,
    protected readonly storyFile: StoryExplorerStoryFile,
    public readonly label: string,
  ) {
    this.id = story.id;
    this.name = story.name;
    this.location = story.location;
  }

  public getOpenCommand(viewColumn?: ViewColumn) {
    const location = this.location;

    return createOpenInEditorCommand(this.storyFile.getUri(), {
      ...(location && {
        selection: new Range(
          location.start.line - 1,
          location.start.column,
          location.start.line - 1,
          location.start.column,
        ),
      }),
      ...(viewColumn !== undefined && { viewColumn }),
    });
  }
}
