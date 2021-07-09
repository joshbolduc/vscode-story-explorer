import type { TextDocumentShowOptions, Uri } from 'vscode';

interface OpenCommandParams {
  title?: string;
  tooltip?: string;
  arguments: readonly [uri: Uri, options?: TextDocumentShowOptions];
}

export interface OpenCommandStaticProperties {
  command: 'vscode.open';
}

export const createOpenInEditorCommand = (
  uri: Uri,
  options?: TextDocumentShowOptions,
) => {
  return createOpenCommand({
    title: 'Open',
    tooltip: 'Open in Editor',
    arguments: [uri, options],
  });
};

export const createOpenCommand = <T extends OpenCommandParams>({
  title,
  tooltip,
  arguments: args,
}: T) => {
  return {
    command: 'vscode.open',
    title,
    tooltip,
    arguments: args,
  } as T & OpenCommandStaticProperties;
};
