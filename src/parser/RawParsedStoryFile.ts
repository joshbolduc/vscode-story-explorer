import type { Location } from '../types/Location';

export interface RawParsedStoriesMeta {
  id: string | undefined;
  title: string | undefined;
  location: Location | undefined;
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
