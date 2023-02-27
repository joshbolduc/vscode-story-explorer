import type { Uri } from 'vscode';
import { getFileContentFromFs } from './getFileContent';

export const getParsedPackageJson = async (uri: Uri) => {
  const packageJsonContents = await getFileContentFromFs(uri);
  return JSON.parse(packageJsonContents) as unknown;
};
