import type { Uri } from 'vscode';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { IconName } from '../util/getIconPath';
import { BaseTreeNode } from './BaseTreeNode';
import type { TreeNode } from './TreeNode';

export class KindTreeNode extends BaseTreeNode {
  public readonly type = 'kind';

  /**
   * The story file(s) backing this node, if any.
   */
  public readonly files: StoryExplorerStoryFile[] = [];

  /**
   * The node's children.
   */
  private readonly children: TreeNode[] = [];

  public hasStoryChildren() {
    return this.children.some((child) => child.type === 'story');
  }

  public getIconName(): IconName | undefined {
    const leafEntry = this.getLeafEntry();
    if (leafEntry) {
      return leafEntry.iconName;
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
   * Gets a docs entry for the file that maps to this kind node, if one exists.
   *
   * @returns A docs entry that maps to this kind node, if one exists.
   */
  public getDocs() {
    return this.getSingleFile()?.getDocs();
  }

  public matchesUri(uri: Uri) {
    return this.files.some(
      (file) => file.getUri().toString() === uri.toString(),
    );
  }

  public getChildren(): readonly TreeNode[] {
    // If this is a hoisted story, it effectively has no children
    if (this.getHoistedStory()) {
      return [];
    }

    return this.children;
  }

  public getEntry() {
    return this.getHoistedStory() || this.getDocs();
  }

  public getLeafEntry() {
    return this.getHoistedStory() || this.getHoistedDocs();
  }

  public addChild(childNode: TreeNode) {
    this.children.push(childNode);
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

  private getHoistedDocs() {
    // Docs can be treated as hoisted if there is only one file here and it's a
    // docs-only story
    const file = this.getSingleFile();
    if (file?.isDocsOnly()) {
      return file.getDocs();
    }
  }

  private getSingleFile() {
    if (this.files.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- known length 1
      return this.files[0]!;
    }
  }
}
