import { basename, extname } from 'path';
import {
  Command,
  ExtensionContext,
  TextDocumentShowOptions,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
} from 'vscode';
import { URI } from 'vscode-uri';
import { addSerializer } from '../../test/util/addSerializer';
import { getTestStoryFiles } from '../../test/util/getTestStoryFiles';
import type { StoryStore } from '../store/StoryStore';
import { hasProperty } from '../util/guards/hasProperty';
import { isTruthy } from '../util/guards/isTruthy';
import { StoryTreeDataProvider } from './StoryTreeDataProvider';
import type { TreeNode } from './TreeNode';
import { TreeNodeItem } from './TreeNodeItem';

interface TreeItemRepresentation {
  item: TreeItem;
  children?: TreeItemRepresentation[];
  isTreeItem: true;
}

const isTreeItemRepresentation = (v: unknown): v is TreeItemRepresentation =>
  hasProperty('isTreeItem')(v) && v.isTreeItem === true;

addSerializer({
  test: (v): v is TreeNodeItem => v instanceof TreeNodeItem,
  serialize: (v, config, indentation, depth, refs, printer) => {
    const stringifyCommand = (command: Command) => {
      if (
        command.command === 'vscode.open' &&
        command.title === 'Open' &&
        command.tooltip === 'Open in Editor'
      ) {
        const [file, options = {}] = command.arguments as
          | [Uri]
          | [Uri, TextDocumentShowOptions | undefined];

        return [
          'Open file',
          file !== v.resourceUri && file.toString(),
          options.selection &&
            printer(options.selection, config, indentation, depth, refs),
        ]
          .filter(isTruthy)
          .join(' ');
      }

      return printer(command, config, `${indentation}  `, depth, refs);
    };

    return [
      `- ${v.label!.toString()}`,
      v.id && `Id: ${v.id}`,
      v.resourceUri && `File: ${v.resourceUri.toString()}`,
      v.contextValue && `Context: ${v.contextValue}`,
      v.collapsibleState !== undefined &&
        v.collapsibleState !== TreeItemCollapsibleState.None &&
        TreeItemCollapsibleState[v.collapsibleState],
      v.iconPath &&
        `Icon: ${basename(v.iconPath.toString()).slice(
          0,
          -extname(v.iconPath.toString()).length,
        )}`,
      v.command && `Command: ${stringifyCommand(v.command)}`,
    ]
      .filter(isTruthy)
      .join(`\n${indentation}  `);
  },
});

addSerializer({
  test: (v): v is TreeItemRepresentation[] =>
    Array.isArray(v) && v.every(isTreeItemRepresentation),
  serialize: (v, config, indentation, depth, refs, printer) => {
    return v
      .map((item) => {
        return printer(item, config, indentation, depth, refs);
      })
      .join(`\n\n${indentation}`);
  },
});

addSerializer({
  test: isTreeItemRepresentation,
  serialize: (
    { item, children },
    config,
    indentation,
    depth,
    refs,
    printer,
  ) => {
    const childrenStr =
      !children || children.length === 0
        ? ''
        : `\n\n${indentation}  ${printer(
            children,
            config,
            `${indentation}  `,
            depth,
            refs,
          )}`;

    return `${printer(item, config, indentation, depth, refs)}${childrenStr}`;
  },
});

describe('StoryTreeDataProvider', () => {
  it('creates tree from story files', async () => {
    const storyFiles = await getTestStoryFiles();
    const mockContext = {
      extensionUri: URI.file('/mock/extension/root'),
    } as ExtensionContext;

    const mockStore = {
      getSortedStoryFiles: () => Promise.resolve(storyFiles),
      onDidUpdateStoryStore: () => ({
        dispose: () => {
          // no-op
        },
      }),
      waitUntilInitialized: () => Promise.resolve(mockStore),
    } as Partial<StoryStore> as StoryStore;

    const provider = new StoryTreeDataProvider(mockContext, mockStore);

    const nodeToTreeItem = async (
      node: TreeNode,
    ): Promise<TreeItemRepresentation> => {
      const childItems = (await provider.getChildren(node))?.map(
        nodeToTreeItem,
      );

      return {
        item: await provider.getTreeItem(node),
        ...(childItems &&
          childItems.length > 0 && {
            children: await Promise.all(childItems),
          }),
        isTreeItem: true,
      };
    };

    const rootChildren = await Promise.all(
      (await provider.getChildren())!.map(nodeToTreeItem),
    );
    expect(rootChildren).toMatchSnapshot();
  });
});
