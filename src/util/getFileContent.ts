import { Uri, workspace } from 'vscode';

const getDocumentForUri = (uri: Uri) => {
  return workspace.textDocuments.find(
    (document) => document.uri.toString() === uri.toString(),
  );
};

/**
 * Get the content of a file. If the file is open, the contents of the open file
 * will be returned. Otherwise, the file's contents will be read from the
 * filesystem.
 *
 * @param uri The file's URI
 * @returns The file's content
 */
export const getFileContent = async (uri: Uri) => {
  const document = getDocumentForUri(uri);
  if (document) {
    return document.getText();
  } else {
    const buffer = await workspace.fs.readFile(uri);
    return buffer.toString();
  }
};
