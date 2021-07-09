import type { Location } from '../types/Location';

export interface StoriesMeta {
  id: string | undefined;
  location: Location | undefined;
  title: string | undefined;
}

export interface ParsedCsfStory {
  id: string | undefined;
  location: Location | undefined;
  name: string;
}

export interface ParsedMdxStory {
  id: string | undefined;
  location: Location | undefined;
  name: string | undefined;
}

export interface Story {
  id: string;
  location: Location | undefined;
  name: string;
}

export interface ParsedCsfStoriesFile {
  meta: StoriesMeta;
  stories: ParsedCsfStory[];
}

export interface ParsedMdxStoriesFile {
  meta: StoriesMeta;
  stories: ParsedMdxStory[];
}

export type ParsedStoriesFile = ParsedCsfStoriesFile | ParsedMdxStoriesFile;
