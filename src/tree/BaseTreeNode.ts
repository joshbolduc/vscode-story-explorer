import type { StoryExplorerEntry } from '../story/StoryExplorerEntry';
import type { KindTreeNode } from './KindTreeNode';

/**
 * An internal representation of a node in the story tree.
 */
export abstract class BaseTreeNode {
  /**
   * The name for this tree node, e.g., a portion of the kind hierarchy or story
   * name.
   */
  public readonly name: string;

  /**
   * The node's parent, if any.
   */
  public readonly parent?: KindTreeNode | undefined;

  /**
   * The node's type. `kind` is any intermediate entry or file (including
   * docs-only stories and hoisted stories). `story` is a leaf node
   * corresponding to an ordinary story exported from a story file.
   */
  public abstract readonly type: 'kind' | 'story';

  public constructor({ name, parent }: Pick<BaseTreeNode, 'name' | 'parent'>) {
    this.name = name;
    this.parent = parent;
  }

  /**
   * Returns an entry associated with this node, if one exists. This may return
   * an entry even if this node has children, such as for a component with both
   * individual stories and docs in Storybook 6.x.
   * @returns An entry associated with this node, if one exists.
   */
  public abstract getEntry(): StoryExplorerEntry | undefined;

  /**
   * Returns an entry associated with this node, if one exists and this node is
   * acting as a leaf.
   * @returns An entry associated with this node, if one exists.
   */
  public abstract getLeafEntry(): StoryExplorerEntry | undefined;
}
