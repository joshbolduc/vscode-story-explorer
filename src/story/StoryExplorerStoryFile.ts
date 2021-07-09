import type { ParsedStoryWithFileUri } from '../parser/parseStoriesFileByUri';
import { StoryExplorerStory } from './StoryExplorerStory';

export class StoryExplorerStoryFile {
  public readonly docsStory?: StoryExplorerStory;

  private readonly stories: StoryExplorerStory[];

  public constructor(private readonly parsed: ParsedStoryWithFileUri) {
    this.stories = parsed.stories.reduce<StoryExplorerStory[]>((acc, story) => {
      const { id, location, name } = story;
      if (id && name) {
        acc.push(StoryExplorerStory.fromStory({ id, location, name }, this));
      }

      return acc;
    }, []);

    this.docsStory = StoryExplorerStory.fromStoryFileForDocs(this);
  }

  public getUri() {
    return this.parsed.file;
  }

  public getTitle() {
    return this.parsed.meta.title;
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
    return this.isMdx() && this.stories.length === 0;
  }

  public getMetaLocation() {
    return this.parsed.meta.location;
  }

  public isMdx() {
    return this.parsed.type === 'mdx';
  }
}
