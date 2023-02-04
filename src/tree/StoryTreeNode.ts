import type { StoryExplorerStory } from '../story/StoryExplorerStory';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { IconName } from '../util/getIconPath';
import { BaseTreeNode } from './BaseTreeNode';
import type { KindTreeNode } from './KindTreeNode';

export class StoryTreeNode extends BaseTreeNode {
  public readonly type = 'story';

  /**
   * The story file backing this node.
   */
  public readonly file: StoryExplorerStoryFile;

  /**
   * The story backing this node.
   */
  public story: StoryExplorerStory;

  /**
   * The node's parent.
   */
  public readonly parent: KindTreeNode;

  public constructor({
    name,
    parent,
    story,
    file,
  }: Pick<StoryTreeNode, 'name' | 'parent' | 'story' | 'file'>) {
    super({ name, parent });

    this.file = file;
    this.story = story;
    this.parent = parent;
  }

  public getIconName(): IconName | undefined {
    return 'bookmark';
  }

  public getEntry() {
    return this.story;
  }

  public getLeafEntry() {
    return this.story;
  }
}
