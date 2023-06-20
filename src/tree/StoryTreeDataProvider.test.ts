import { basename, extname } from 'path';
import { describe, expect, it, vitest } from 'vitest';
import type { Command, TextDocumentShowOptions, Uri } from 'vscode';
import { TreeItemCollapsibleState } from 'vscode';
import { addSerializer } from '../../test/util/addSerializer';
import type { TreeItemRepresentation } from '../../test/util/getTreeRoots';
import { getTreeRoots } from '../../test/util/getTreeRoots';
import { hasProperty } from '../util/guards/hasProperty';
import { isTruthy } from '../util/guards/isTruthy';
import { TreeNodeItem } from './TreeNodeItem';

vitest.mock('../config/autodocs');

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
      typeof v.description === 'string' &&
        v.description !== v.resourceUri?.toString() &&
        `Description: ${v.description}`,
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
  [
    {
      version: '6' as const,
      configPath: '.config-unittest/main.js',
    },
    {
      version: '7' as const,
      configPath: '.storybook/main.ts',
    },
  ].forEach(({ version, configPath }) =>
    it(`creates tree from story files for v${version}`, async () => {
      const rootChildren = await getTreeRoots(version, configPath);
      expect(rootChildren).toMatchSnapshot();
    }),
  );
});
