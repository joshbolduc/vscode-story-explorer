import type { Uri } from 'vscode';

// Inspired by
// https://code.visualstudio.com/api/extension-guides/virtual-workspaces#detect-virtual-workspaces-programmatically
export const isVirtualUri = (uri: Uri) => {
  return uri.scheme !== 'file';
};
