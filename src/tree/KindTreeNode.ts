import type { Uri } from 'vscode';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { IconName } from '../util/getIconPath';
import { BaseTreeNode, BaseTreeNodeConstuctorParams } from './BaseTreeNode';
import type { TreeNode } from './TreeNode';

export interface TreeNodeCreationOptions {
  showAutodocsAsChildren: boolean;
}

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

  public constructor(
    baseProps: BaseTreeNodeConstuctorParams,
    protected readonly options: TreeNodeCreationOptions,
  ) {
    super(baseProps);
  }

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

    // Use folder icon if there are nested children or no stories
    if (
      this.children.some(
        (child) => child.type === 'kind' && child.children.length > 0,
      ) ||
      this.children.every((child) => child.getEntry()?.type !== 'story')
    ) {
      return 'folder';
    }

    return 'component';
  }

  /**
   * Gets a docs entry for the file that maps to this kind node, if one exists.
   *
   * @returns A docs entry that maps to this kind node, if one exists.
   */
  public getDocs() {
    // We only hoist docs to the last node in the title if docs aren't being
    // shown as children nodes (as in Storybook 7+). (Docs only nodes aren't
    // really being "hoisted," so we allow those.)
    if (
      this.options.showAutodocsAsChildren &&
      !this.getSingleFile()?.isDocsOnly()
    ) {
      return undefined;
    }

    return this.getSingleFile()?.getDocs();
  }

  public matchesUri(uri: Uri) {
    return this.files.some(
      (file) => file.getUri().toString() === uri.toString(),
    );
  }

  public getChildren(): readonly TreeNode[] {
    // If this is treated as hoisted, it effectively has no children
    if (this.getHoistedStory() || this.getHoistedDocs()) {
      return [];
    }

    return this.children;
  }

  public getEntry() {
    if (this.options.showAutodocsAsChildren) {
      return this.getLeafEntry();
    }
    return this.getHoistedStory() || this.getDocs();
  }

  public getLeafEntry() {
    return this.getHoistedStory() || this.getHoistedDocs();
  }

  public addChild(childNode: TreeNode) {
    this.children.push(childNode);
  }

  public updateName(name: string) {
    this._name = name;
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
    if (
      file?.isDocsOnly() &&
      // If autodocs are rendered as children, make sure that one child is the
      // autodocs entry
      (!this.options.showAutodocsAsChildren ||
        (this.children.length === 1 &&
          this.children[0]?.getEntry() === file.getDocs()))
    ) {
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
