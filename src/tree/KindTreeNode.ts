import type { Uri } from 'vscode';
import type { StoryExplorerStory } from '../story/StoryExplorerStory';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { IconName } from '../util/getIconPath';
import type { TreeNode } from './TreeNode';
import { TreeNodeBase } from './TreeNodeBase';

export class KindTreeNode extends TreeNodeBase {
  public readonly type = 'kind';

  /**
   * The story file(s) backing this node, if any.
   */
  public readonly files: StoryExplorerStoryFile[] = [];

  public docsStory?: StoryExplorerStory;

  /**
   * The node's children.
   */
  private readonly children: TreeNode[] = [];

  public constructor({ name, parent }: Pick<KindTreeNode, 'name' | 'parent'>) {
    super({ name, parent });
  }

  public hasStoryChildren() {
    return this.children.some((child) => child.type === 'story');
  }

  public getIconName(): IconName | undefined {
    const effectiveStory = this.getEffectiveStory(true);
    if (effectiveStory) {
      return effectiveStory.getIconName();
    }

    // Root node (when not treated as story) has no icon if there no immediate
    // child stories
    if (!this.parent && !this.hasStoryChildren()) {
      return undefined;
    }

    // Use component icon if there are no nested children
    if (
      this.children.every(
        (child) => child.type !== 'kind' || child.children.length === 0,
      )
    ) {
      return 'component';
    }

    return 'folder';
  }

  /**
   * Gets a story that maps to this node, such as a child story that should be
   * hoisted or a docs story corresponding to the node.
   *
   * @param requireDocsOnly Whether to only accept docs stories that are
   * docs-only stories.
   * @returns A story that maps to this kind node, if one exists.
   */
  public getEffectiveStory(requireDocsOnly: boolean) {
    // If there is a story hoisted to this node, use it
    const hoistedStory = this.getHoistedStory();
    if (hoistedStory) {
      return hoistedStory;
    }

    // Treat this node as a docs-only story, assuming there is only one file
    // here and it's a docs-only story
    if (this.files.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- known length 1
      const file = this.files[0]!;

      if (file.isDocsOnly() || !requireDocsOnly) {
        return file.docsStory;
      }
    }
  }

  public matchesUri(uri: Uri) {
    return this.files.some(
      (file) => file.getUri().toString() === uri.toString(),
    );
  }

  public getChildren() {
    // If this is a hoisted story, it effectively has no children
    if (this.getHoistedStory()) {
      return [];
    }

    return this.children;
  }

  public getAllChildren() {
    return this.children;
  }

  /**
   * Gets a story that should be considered hoisted to this node. A hoisted
   * story if its name is exactly the same as its parent's display name, and it
   * has no siblings.
   * @see
   * https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#single-story-hoisting
   */
  private getHoistedStory() {
    if (this.children.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- known length 1
      const child = this.children[0]!;
      if (child.type === 'story' && child.name === this.name) {
        return child.story;
      }
    }
  }
}
