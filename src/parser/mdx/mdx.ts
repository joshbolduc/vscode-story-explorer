import { storyNameFromExport, toId } from '@componentdriven/csf';
import { logDebug } from '../../log/log';
import { isDefined } from '../../util/isDefined';
import { sanitizeMetaObject } from '../sanitizeMetaObject';
import { parseFromContents } from './parseFromContents';

const parse = (contents: string) => {
  const parsed = parseFromContents(contents);

  if (parsed) {
    const { id, title } = sanitizeMetaObject(parsed.meta.properties.values);

    const meta = {
      id,
      title,
      location: parsed.meta.location,
    };

    const stories = parsed.stories
      .map((story) => {
        const { name: nameProp, id: idProp } = story.properties.values;

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

        const getId = () => {
          if (!id) {
            return undefined;
          }

          // When the `story` prop is given, the ID is based on the imported
          // name.
          if (storyNameFromStoryRefShortName) {
            return toId(id, storyNameFromStoryRefShortName);
          }

          return namePropAsString !== undefined
            ? toId(id, namePropAsString)
            : undefined;
        };
        const storyId = getId();

        // If not specified as a prop, the actual name will be whatever the name
        // of the imported story is. But we don't (yet) resolve imports, so
        // use `storyNameFromStoryRefShortName` as a best guess.
        const name = namePropAsString ?? storyNameFromStoryRefShortName;

        return {
          location: story.location,
          id: storyId,
          name,
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
