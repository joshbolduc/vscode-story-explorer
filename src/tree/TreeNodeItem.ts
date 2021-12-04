import {
  ExtensionContext,
  TreeItem,
  TreeItemCollapsibleState,
  window,
  workspace,
} from 'vscode';
import { createOpenInEditorCommand } from '../util/createOpenCommand';
import { getIconPath } from '../util/getIconPath';
import type { TreeNode } from './TreeNode';
import { findEntryByUri } from './findEntryByUri';

const getDefaultCollapsedState = (
  entry: TreeNode,
): TreeItemCollapsibleState => {
  if (entry.type === 'story' || entry.getChildren().length === 0) {
    return TreeItemCollapsibleState.None;
  }

  const isTopLevel = !entry.parent;
  if (isTopLevel) {
    return TreeItemCollapsibleState.Expanded;
  }

  const activeUri = window.activeTextEditor?.document.uri;
  const hasActiveFile = activeUri && !!findEntryByUri([entry], activeUri);
  if (hasActiveFile) {
    return TreeItemCollapsibleState.Expanded;
  }

  return TreeItemCollapsibleState.Collapsed;
};

export class TreeNodeItem extends TreeItem {
  private constructor(
    node: TreeNode,
    context: ExtensionContext,
    label: string,
  ) {
    super(label, getDefaultCollapsedState(node));

    // If kind has multiple files, arbitrarily pick the first one
    const file = node.type === 'kind' ? node.files[0] : undefined;

    const uri = file?.getUri();

    if (uri) {
      this.id = uri.toString();

      const relativePath = workspace.asRelativePath(uri);
      this.description =
        node.type === 'kind' && node.files.length > 1
          ? `${node.files.length} files · ${relativePath}`
          : relativePath;
      this.resourceUri = uri;
      this.command = createOpenInEditorCommand(uri);
    }

    const effectiveStory =
      node.type === 'story' ? node.story : node.getEffectiveStory(false);

    if (effectiveStory) {
      this.id = effectiveStory.id;
      this.command = effectiveStory.getOpenCommand();
      this.contextValue = 'story';
    }

    const iconName = node.getIconName();
    if (iconName) {
      this.iconPath = getIconPath(iconName, context);
    }
  }

  public static fromTreeNode(node: TreeNode, context: ExtensionContext) {
    const label = node.name.trim();
    const item = new TreeNodeItem(node, context, label);

    return item;
  }
}
