import type { Uri } from 'vscode';

export interface GlobSpecifier {
  directory: Uri;
  files: string;
  titlePrefix: string;
}
