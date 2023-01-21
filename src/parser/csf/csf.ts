import {
  IncludeExcludeOptions,
  isExportStory,
  storyNameFromExport,
} from '@componentdriven/csf';
import { logDebug } from '../../log/log';
import type { RawParsedStoryFile } from '../RawParsedStoryFile';
import { sanitizeMetaObject } from '../sanitizeMetaObject';
import { parseFromContents, RawStory } from './parseFromContents';

const getStoryName = (rawStory: RawStory) => {
  const hoistedStoryName = rawStory.properties.storyName;

  if (typeof hoistedStoryName === 'string' && hoistedStoryName) {
    return hoistedStoryName;
  }

  const { story } = rawStory.properties;
  if (typeof story === 'object' && story && 'name' in story) {
    const csfV1StoryName: unknown = (story as Record<string, unknown>).name;
    if (typeof csfV1StoryName === 'string' && csfV1StoryName) {
      return csfV1StoryName;
    }
  }

  return storyNameFromExport(rawStory.exportName);
};

const parseCsf = (contents: string): RawParsedStoryFile | undefined => {
  const parsed = parseFromContents(contents);

  if (!parsed.meta.declared) {
    return undefined;
  }

  const { id, title } = sanitizeMetaObject(parsed.meta.properties);

  const meta = {
    id,
    title,
    location: parsed.meta.location,
  };

  const { excludeStories, includeStories } = parsed.meta
    .properties as IncludeExcludeOptions;

  const stories = parsed.stories
    .filter(({ exportName }) => {
      return isExportStory(exportName, {
        ...(excludeStories !== undefined && { excludeStories }),
        ...(includeStories !== undefined && { includeStories }),
      });
    })
    .map((story) => {
      return {
        location: story.location,
        name: getStoryName(story),
        nameForId: storyNameFromExport(story.exportName),
      };
    });

  return { meta, stories };
};

export const tryParseCsf = (contents: string) => {
  try {
    return parseCsf(contents);
  } catch (e) {
    // Most likely due to transient syntax error
    logDebug('Failed to parse contents as CSF');
  }
  return undefined;
};
