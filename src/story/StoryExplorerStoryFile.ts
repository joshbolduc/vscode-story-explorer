import { sanitize } from '@componentdriven/csf';
import startCase from 'lodash/startCase';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { StoryExplorerStory } from './StoryExplorerStory';

export class StoryExplorerStoryFile {
  public readonly docsStory?: StoryExplorerStory;

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

    this.docsStory = StoryExplorerStory.fromStoryFileForDocs(this);
  }

  public getUri() {
    return this.parsed.file;
  }

  public getTitle() {
    const title = this.parsed.meta.title;

    if (title) {
      return title;
    }

    const generateTitle = (specifier: GlobSpecifier) => {
      const uriPath = this.getUri().path;
      if (!uriPath.startsWith(specifier.directory)) {
        return undefined;
      }

      const fileSuffix = uriPath.slice(specifier.directory.length);

      const extensionIndex = fileSuffix.indexOf('.');

      const suffixWithoutExtension =
        extensionIndex > 0 ? fileSuffix.slice(0, extensionIndex) : fileSuffix;

      const autoTitleParts = [
        ...(specifier.titlePrefix?.split('/') ?? []),
        ...suffixWithoutExtension.split('/'),
      ]
        .map(startCase)
        .filter(Boolean);

      return autoTitleParts.join('/');
    };

    for (const specifier of this.specifiers) {
      const autoTitle = generateTitle(specifier);

      if (autoTitle) {
        return autoTitle;
      }
    }
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

  public getAllStories() {
    return [this.docsStory, ...this.stories].filter(
      Boolean,
    ) as StoryExplorerStory[];
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
