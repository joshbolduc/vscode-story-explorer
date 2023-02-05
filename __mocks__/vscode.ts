import type * as vscode from 'vscode';
import { URI, Utils } from 'vscode-uri';

export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3,
}

/**
 * Collapsible state of the tree item
 */
export enum TreeItemCollapsibleState {
  /**
   * Determines an item can be neither collapsed nor expanded. Implies it has no children.
   */
  None = 0,
  /**
   * Determines an item is collapsed
   */
  Collapsed = 1,
  /**
   * Determines an item is expanded
   */
  Expanded = 2,
}

export class RelativePattern {
  public constructor(base: string, pattern: string) {
    return { base, pattern };
  }
}

export class EventEmitter {}

export class Range {
  public start: { line: number; column: number };
  public end: { line: number; column: number };

  public constructor(
    startLine: number,
    startCharacter: number,
    endLine: number,
    endCharacter: number,
  ) {
    this.start = { line: startLine, column: startCharacter };
    this.end = { line: endLine, column: endCharacter };
  }
}

export class TreeItem {
  public constructor(
    public label: string,
    public collapsibleState?: TreeItemCollapsibleState,
  ) {}
}

export const Uri = {
  ...URI,
  ...Utils,
};

export enum ColorThemeKind {
  Light = 1,
  Dark = 2,
  HighContrast = 3,
}

export const window = {
  activeColorTheme: { kind: ColorThemeKind.Dark },
} satisfies Partial<typeof vscode.window>;

export const workspace = {
  asRelativePath: (uri) => uri.toString(),
  getConfiguration: (() => {
    return {
      get: (_section, defaultValue) => defaultValue,
    };
  }) as typeof vscode.workspace.getConfiguration,
  onDidChangeConfiguration: () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return { dispose: () => {} };
  },
} satisfies Partial<typeof vscode.workspace>;
