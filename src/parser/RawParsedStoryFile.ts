import type { Location } from '../types/Location';

export interface RawParsedStoriesMeta {
  id: string | undefined;
  tags: string[] | undefined;
  title: string | undefined;
  location: Location | undefined;
  of?: { importPath: string } | undefined;
  name?: string | undefined;
}

export interface RawParsedStory {
  location: Location | undefined;
  name: string | undefined;
  nameForId: string | undefined;
}

export interface RawParsedStoryFile {
  meta: RawParsedStoriesMeta;
  stories: RawParsedStory[];
}
