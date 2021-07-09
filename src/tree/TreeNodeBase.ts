import type { KindTreeNode } from './KindTreeNode';

/**
 * An internal representation of a node in the story tree.
 */
export abstract class TreeNodeBase {
  /**
   * The name for this tree node, e.g., a portion of the kind hierarchy or story
   * name.
   */
  public readonly name: string;
  /**
   * The node's parent, if any.
   */
  public readonly parent?: KindTreeNode;
  /**
   * The node's type. `kind` is any intermediate entry or file (including
   * docs-only stories and hoisted stories). `story` is a leaf node
   * corresponding to an ordinary story exported from a story file.
   */
  public abstract readonly type: 'kind' | 'story';

  protected constructor({
    name,
    parent,
  }: Pick<TreeNodeBase, 'name' | 'parent'>) {
    this.name = name;
    this.parent = parent;
  }
}
