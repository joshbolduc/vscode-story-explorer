import { Uri, workspace } from 'vscode';
import { configFileExtensions } from './configFileExtensions';

export const findConfigFileInDir = async (dir: Uri) => {
  for (const extension of configFileExtensions) {
    try {
      const uri = Uri.joinPath(dir, `main.${extension}`);
      await workspace.fs.stat(uri);
      return uri;
    } catch {
      // assume file doesn't exist
    }
  }
};
