import { isExportStory, storyNameFromExport } from '@componentdriven/csf';
import { logDebug } from '../../log/log';
import { hasProperty } from '../../util/guards/hasProperty';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import type { RawParsedStoryFile } from '../RawParsedStoryFile';
import { sanitizeMetaObject } from '../sanitizeMetaObject';
import { isStoryDescriptor } from './isStoryDescriptor';
import type { RawStory } from './parseFromContents';
import { parseFromContents } from './parseFromContents';

export interface CsfParseOptions {
  /**
   * Whether to use looser story name override semantics, as used in SB 6 (but
   * not SB 7). When disabled:
   * - `storyName` is recognized as a story's display name if the property is
   *   assigned directly (`Story.storyName = 'Foo'`)
   * - `name` is recognized as a story's display name if the property is
   *   assigned as part of the story object's initial declaration (`{ name:
   *   'Foo' }`)
   * When enabled, either `storyName` or `name` are respected in either context.
   * @see https://github.com/storybookjs/storybook/issues/17548
   */
  useLooseStoryNameSemantics: boolean;
}

const getStoryName = (
  rawStory: RawStory,
  useLooseStoryNameSemantics: boolean,
) => {
  // @example
  // Story.storyName = 'Foo'
  if (
    rawStory.properties.storyName?.isPartOfDeclaration === false &&
    isNonEmptyString(rawStory.properties.storyName.value)
  ) {
    return rawStory.properties.storyName.value;
  }

  // @example
  // const Story = { name: 'Foo' }
  if (
    rawStory.properties.name?.isPartOfDeclaration &&
    isNonEmptyString(rawStory.properties.name.value)
  ) {
    return rawStory.properties.name.value;
  }

  // SB 6 only; not supported in SB 7+
  if (useLooseStoryNameSemantics) {
    // @example
    // Story.name = 'Foo'
    if (
      rawStory.properties.name &&
      isNonEmptyString(rawStory.properties.name?.value)
    ) {
      return rawStory.properties.name.value;
    }

    // @example
    // const Story = { storyName: 'Foo' }
    if (
      rawStory.properties.storyName &&
      isNonEmptyString(rawStory.properties.storyName?.value)
    ) {
      return rawStory.properties.storyName.value;
    }
  }

  // CSF v1
  // @example
  // Story.story = { name: 'Foo' }
  const { story } = rawStory.properties;
  if (story && hasProperty('name')(story.value)) {
    const csfV1StoryName = story.value.name;
    if (typeof csfV1StoryName === 'string' && csfV1StoryName) {
      return csfV1StoryName;
    }
  }

  return storyNameFromExport(rawStory.exportName);
};

const parseCsf = (
  contents: string,
  { useLooseStoryNameSemantics }: CsfParseOptions,
): RawParsedStoryFile | undefined => {
  const parsed = parseFromContents(contents);

  if (!parsed.meta.declared) {
    return undefined;
  }

  const { id, tags, title } = sanitizeMetaObject(parsed.meta.properties);

  const meta = {
    id,
    tags,
    title,
    location: parsed.meta.location,
  };

  const {
    excludeStories: excludeStoriesProp,
    includeStories: includeStoriesProp,
  } = parsed.meta.properties;

  const excludeStories = excludeStoriesProp?.value;
  const includeStories = includeStoriesProp?.value;

  const stories = parsed.stories
    .filter(({ exportName }) => {
      return isExportStory(exportName, {
        ...(isStoryDescriptor(excludeStories) && {
          excludeStories,
        }),
        ...(isStoryDescriptor(includeStories) && {
          includeStories,
        }),
      });
    })
    .map((story) => {
      return {
        location: story.location,
        name: getStoryName(story, useLooseStoryNameSemantics),
        nameForId: storyNameFromExport(story.exportName),
      };
    });

  return { meta, stories };
};

export const tryParseCsf = (contents: string, options: CsfParseOptions) => {
  try {
    return parseCsf(contents, options);
  } catch (e) {
    // Most likely due to transient syntax error
    logDebug('Failed to parse contents as CSF');
  }
  return undefined;
};
