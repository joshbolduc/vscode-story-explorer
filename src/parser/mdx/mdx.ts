import { storyNameFromExport } from '@componentdriven/csf';
import { logDebug } from '../../log/log';
import { isDefined } from '../../util/guards/isDefined';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import type { RawParsedStoryFile } from '../RawParsedStoryFile';
import { sanitizeMetaObject } from '../sanitizeMetaObject';
import { parseFromContents } from './parseFromContents';

const parse = (contents: string): RawParsedStoryFile | undefined => {
  const parsed = parseFromContents(contents);

  if (parsed) {
    const { id, tags, title } = sanitizeMetaObject(
      parsed.meta.properties.values,
    );

    const metaName = parsed.meta.properties.values?.name?.value;

    const meta = {
      id,
      tags,
      title,
      location: parsed.meta.location,
      of: parsed.meta.of,
      name: isNonEmptyString(metaName) ? metaName : undefined,
    };

    const stories = parsed.stories
      .map((story) => {
        const nameProp = story.properties.values.name?.value;
        const idProp = story.properties.values.id?.value;

        // <Story id="..." /> just refers to another story and doesn't create an
        // entry in the store, so we'll disregard it.
        if (idProp !== undefined) {
          return undefined;
        }

        const namePropAsString =
          typeof nameProp === 'string' ? nameProp : undefined;

        const storyRefName = story.properties.literals.story;
        const storyRefShortName = storyRefName?.split('.').slice(-1)[0];
        const storyNameFromStoryRefShortName =
          storyRefShortName !== undefined
            ? storyNameFromExport(storyRefShortName)
            : undefined;

        // If not specified as a prop, the actual name will be whatever the name
        // of the imported story is. But we don't (yet) resolve imports, so
        // use `storyNameFromStoryRefShortName` as a best guess.
        const name = namePropAsString ?? storyNameFromStoryRefShortName;

        return {
          location: story.location,
          name,
          nameForId: storyNameFromStoryRefShortName,
        };
      })
      .filter(isDefined);

    return {
      meta,
      stories,
    };
  }
};

export const tryParseMdx = (contents: string) => {
  try {
    return parse(contents);
  } catch (e) {
    // Most likely due to transient syntax error
    logDebug('Failed to parse contents as MDX');
  }
  return undefined;
};
