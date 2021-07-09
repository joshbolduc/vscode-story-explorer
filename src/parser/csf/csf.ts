import {
  IncludeExcludeOptions,
  isExportStory,
  storyNameFromExport,
  toId,
} from '@componentdriven/csf';
import { logDebug } from '../../log/log';
import { parseFromContents, RawStory } from './parseFromContents';

const getStoryName = (rawStory: RawStory) => {
  const hoistedStoryName = rawStory.properties.storyName;

  if (typeof hoistedStoryName === 'string') {
    return hoistedStoryName || storyNameFromExport(rawStory.exportName);
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

const parseCsf = (contents: string) => {
  const parsed = parseFromContents(contents);

  const { title } = parsed.meta.properties;
  const titleAsString = typeof title === 'string' ? title : undefined;

  const meta = {
    id: parsed.meta.id,
    location: parsed.meta.location,
    title: titleAsString,
  };

  const { excludeStories, includeStories } = parsed.meta
    .properties as IncludeExcludeOptions;

  const stories = parsed.stories
    .filter(({ exportName }) => {
      return isExportStory(exportName, {
        excludeStories,
        includeStories,
      });
    })
    .map((story) => {
      const niceStoryName = storyNameFromExport(story.exportName);
      const { title: storyTitle } = parsed.meta.properties;
      const id =
        typeof storyTitle === 'string' && niceStoryName
          ? toId(storyTitle, niceStoryName)
          : undefined;

      return { ...story, id, name: getStoryName(story) };
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
