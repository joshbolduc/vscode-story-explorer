import { sanitize } from '@componentdriven/csf';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { isDefined } from '../util/guards/isDefined';
import { StoryExplorerDocs } from './StoryExplorerDocs';
import { StoryExplorerStory } from './StoryExplorerStory';
import { getAutoTitleSuffixParts } from './getAutoTitleSuffixParts';
import { getPartialFilePath } from './getPartialFilePath';

export class StoryExplorerStoryFile {
  private readonly docs?: StoryExplorerDocs | undefined;

  private readonly stories: StoryExplorerStory[];

  public constructor(
    private readonly parsed: ParsedStoryWithFileUri,
    private readonly specifiers: GlobSpecifier[],
  ) {
    this.stories = parsed.stories.reduce<StoryExplorerStory[]>((acc, story) => {
      const { nameForId, location, name } = story;

      if (name) {
        const seStory = StoryExplorerStory.fromStory(
          { nameForId, location, name },
          this,
        );
        if (seStory) {
          acc.push(seStory);
        }
      }

      return acc;
    }, []);

    this.docs = StoryExplorerDocs.fromStoryFileForDocs(this);
  }

  public getUri() {
    return this.parsed.file;
  }

  public getTitle() {
    const uri = this.getUri();
    const matchingSpecifier = this.specifiers.find(
      (specifier) =>
        uri.scheme === specifier.directory.scheme &&
        uri.authority === specifier.directory.authority &&
        uri.path.startsWith(specifier.directory.path),
    );

    if (!matchingSpecifier) {
      return undefined;
    }

    const titlePrefixParts = matchingSpecifier.titlePrefix.split('/');

    const metaTitle = this.parsed.meta.title;
    const titleSuffix = metaTitle
      ? metaTitle.split('/')
      : getAutoTitleSuffixParts(
          getPartialFilePath(matchingSpecifier.directory.path, uri.path),
        );

    const autoTitleParts = [...titlePrefixParts, ...titleSuffix].filter(
      Boolean,
    );

    return autoTitleParts.join('/');
  }

  public getId() {
    const metaId = this.parsed.meta.id;
    if (metaId) {
      return metaId;
    }

    const title = this.getTitle();

    if (title) {
      return sanitize(title);
    }
  }

  public getStories() {
    return this.stories;
  }

  public getDocs() {
    return this.docs;
  }

  public getStoriesAndDocs() {
    return [this.getDocs(), ...this.stories].filter(isDefined);
  }

  public isDocsOnly() {
    return this.isMdx() && this.parsed.stories.length === 0;
  }

  public getMetaLocation() {
    return this.parsed.meta.location;
  }

  public isMdx() {
    return this.parsed.type === 'mdx';
  }
}
