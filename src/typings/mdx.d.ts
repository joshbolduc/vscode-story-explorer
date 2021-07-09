declare module '@mdx-js/mdx' {
  export interface PositionPoint {
    line: number;
    column: number;
    offset: number;
  }

  export interface Position {
    start: PositionPoint;
    end: PositionPoint;
  }

  export interface RootNode {
    type: 'root';
    children: (JsxNode | ImportNode | ExportNode | ElementNode)[];
    position: Position;
  }

  export interface JsxNode {
    type: 'jsx';
    value: string;
    position: Position;
  }

  export interface ImportNode {
    type: 'import';
    value: string;
    position: Position;
  }

  export interface ExportNode {
    type: 'export';
    value: string;
    position: Position;
  }

  export interface ElementNode {
    type: 'element';
    tagName: string;
    properties: Record<string, unknown>;
    position: Position;
    value?: string;
    children: (ElemnetNode | TextNode)[];
  }

  export interface TextNode {
    type: 'text';
    value: string;
    position: Position;
  }

  export type MdxNode =
    | JsxNode
    | ImportNode
    | ExportNode
    | ElementNode
    | TextNode;

  export const sync: (
    contents: string,
    options: {
      remarkPlugins: (() => (ast: RootNode) => RootNode)[];
    },
  ) => void;
}
