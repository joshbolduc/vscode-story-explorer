import type { Uri } from 'vscode';
import type { StoryExplorerStoryFile } from '../story/StoryExplorerStoryFile';
import type { FileWatcher } from '../util/FileWatcher';

interface BackingMapEntry {
  storyFile: StoryExplorerStoryFile;
  fileWatcher: FileWatcher;
}

const uriToKey = (uri: Uri) => {
  return uri.path;
};

export class BackingMap {
  /**
   * Map of paths (i.e., Uri#path) to entries.
   */
  private readonly map = new Map<string, BackingMapEntry>();

  public get(uri: Uri) {
    return this.map.get(uriToKey(uri));
  }

  public set(uri: Uri, entry: BackingMapEntry) {
    return this.map.set(uriToKey(uri), entry);
  }

  public delete(uri: Uri) {
    this.get(uri)?.fileWatcher.dispose();
    return this.map.delete(uriToKey(uri));
  }

  public values() {
    return this.map.values();
  }

  public clear() {
    for (const { fileWatcher } of this.values()) {
      fileWatcher.dispose();
    }
    this.map.clear();
  }
}
