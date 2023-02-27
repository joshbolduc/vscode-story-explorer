import { sanitize } from '@componentdriven/csf';
import type { GlobSpecifier } from '../config/GlobSpecifier';
import type { AutodocsConfig } from '../config/autodocs';
import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import type { StoryStore } from '../store/StoryStore';
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
    storyStore: StoryStore,
    private readonly autodocsConfig: AutodocsConfig | undefined,
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

    const hasFileLevelDocs =
      // pre-v7 autodocs
      !autodocsConfig ||
      // MDX file
      this.isMdx() ||
      // autodocs everywhere
      autodocsConfig.autodocs === true ||
      // autodocs opt-in for this file
      (autodocsConfig.autodocs === 'tag' && this.hasAutodocsTag());

    if (hasFileLevelDocs) {
      this.docs = StoryExplorerDocs.fromStoryFileForDocs(
        this,
        storyStore,
        autodocsConfig,
      );
    }
  }

  public withRefreshedAttachedDoc(storyStore: StoryStore) {
    return new StoryExplorerStoryFile(
      this.parsed,
      this.specifiers,
      storyStore,
      this.autodocsConfig,
    );
  }

  public getUri() {
    return this.parsed.file;
  }

  public getTitle(): string[] | undefined {
    if (this.isAttachedDoc()) {
      const attachedFileTitle = this.docs?.getAttachedFile()?.getTitle();
      if (attachedFileTitle) {
        return attachedFileTitle;
      }
    }

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

    return autoTitleParts;
  }

  public getId() {
    const metaId = this.parsed.meta.id;
    if (metaId) {
      return metaId;
    }

    if (this.isAttachedDoc()) {
      return this.getDocs()?.id;
    }

    const title = this.getTitle();

    if (title) {
      return sanitize(title.join('/'));
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

  public isAttachedDoc() {
    return this.isMdx() && !!this.getAttachedFileImportPath();
  }

  public getMetaLocation() {
    return this.parsed.meta.location;
  }

  public getAttachedFileImportPath() {
    return this.parsed.meta.of?.importPath;
  }

  public getMetaName() {
    return this.parsed.meta.name;
  }

  private getMetaTags() {
    return this.parsed.meta.tags;
  }

  private hasAutodocsTag() {
    return this.getMetaTags()?.includes('autodocs');
  }

  private isMdx() {
    return this.parsed.type === 'mdx';
  }
}
