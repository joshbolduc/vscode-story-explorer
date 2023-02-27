import { basename, extname } from 'path';
import { toId } from '@componentdriven/csf';
import { Utils } from 'vscode-uri';
import type { AutodocsConfig } from '../config/autodocs';
import { logWarn } from '../log/log';
import type { StoryStore } from '../store/StoryStore';
import { StoryExplorerEntry } from './StoryExplorerEntry';
import type { StoryExplorerStoryFile } from './StoryExplorerStoryFile';

const DOCS_ONLY_STORY_NAME_SB6_x = 'Page';
const STORIES_PARTIAL_EXTENSION = '.stories';
const STORIES_PARTIAL_EXTENSION_LENGTH = STORIES_PARTIAL_EXTENSION.length;

const getStoriesFileBareName = (path: string) => {
  const withoutExtension = basename(path).slice(0, -extname(path).length);
  if (withoutExtension.endsWith(STORIES_PARTIAL_EXTENSION)) {
    return withoutExtension.slice(0, -STORIES_PARTIAL_EXTENSION_LENGTH);
  }
  return withoutExtension;
};

export class StoryExplorerDocs extends StoryExplorerEntry {
  public readonly iconName = 'document';
  public readonly type = 'docs';

  public constructor(
    story: Pick<StoryExplorerEntry, 'id' | 'name' | 'location'>,
    storyFile: StoryExplorerStoryFile,
    label: string,
    private readonly attachedStoryFile?: StoryExplorerStoryFile,
  ) {
    super(story, storyFile, label);
  }

  public static fromStoryFileForDocs(
    storyFile: StoryExplorerStoryFile,
    storyStore: StoryStore,
    autodocsConfig: AutodocsConfig | undefined,
  ) {
    const attachedFilePath = storyFile.getAttachedFileImportPath();
    if (attachedFilePath) {
      const attachedStoryFile = storyStore.getStoryByExtensionlessUri(
        Utils.resolvePath(Utils.dirname(storyFile.getUri()), attachedFilePath),
      );

      const id = attachedStoryFile?.getId();

      const fileNameWithoutExtension = getStoriesFileBareName(
        storyFile.getUri().fsPath,
      );
      const attachedDocNameWithoutExtension =
        getStoriesFileBareName(attachedFilePath);

      const getName = () => {
        const metaName = storyFile.getMetaName();
        if (metaName) {
          return metaName;
        }

        if (
          autodocsConfig &&
          fileNameWithoutExtension === attachedDocNameWithoutExtension
        ) {
          return autodocsConfig.defaultName;
        }

        const fileBasename = Utils.basename(storyFile.getUri());
        const nameWithoutExtension = fileBasename.slice(
          0,
          fileBasename.lastIndexOf('.'),
        );
        return nameWithoutExtension;
      };

      const name = getName();

      if (id) {
        return new StoryExplorerDocs(
          {
            id: toId(id, name),
            location: storyFile.getMetaLocation(),
            name,
          },
          storyFile,
          name,
          attachedStoryFile,
        );
      } else {
        logWarn(
          `Unable to resolve attached doc ${attachedFilePath} for ${storyFile
            .getUri()
            .toString()}`,
        );
      }
    }

    const fileId = storyFile.getId();
    const title = storyFile.getTitle();

    if (typeof fileId !== 'string' || !title) {
      return undefined;
    }

    const [label = ''] = title.slice(-1);

    const getDefaultName = () =>
      autodocsConfig ? autodocsConfig.defaultName : DOCS_ONLY_STORY_NAME_SB6_x;

    const name =
      autodocsConfig || storyFile.isDocsOnly() ? getDefaultName() : label;

    return new StoryExplorerDocs(
      {
        id:
          autodocsConfig || storyFile.isDocsOnly()
            ? toId(fileId, name)
            : fileId,
        location: storyFile.getMetaLocation(),
        name,
      },
      storyFile,
      label,
    );
  }

  public getAttachedFile() {
    return this.attachedStoryFile;
  }
}
