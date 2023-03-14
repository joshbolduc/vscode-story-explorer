import { register } from 'esbuild-register/dist/node';
import type { StorybookConfig } from '../storybook/StorybookConfig';
import { getStoriesGlobs } from '../storybook/getStoriesGlobs';
import { hasProperty } from '../util/guards/hasProperty';
import { isNonEmptyString } from '../util/guards/isNonEmptyString';

export const parse = async (configFilePath: string) => {
  register({
    target: `node${process.version.slice(1)}`,
    format: 'cjs',
    hookIgnoreNodeModules: false,
    tsconfigRaw: `{
      "compilerOptions": {
        "strict": false,
        "skipLibCheck": true,
      },
    }`,
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const result = require(configFilePath) as unknown;
  const config = hasProperty('default')(result) ? result.default : result;

  const stories = hasProperty('stories')(config)
    ? await getStoriesGlobs(config.stories)
    : [];

  const docs = hasProperty('docs')(config) ? config.docs : undefined;

  const autodocs =
    hasProperty('autodocs')(docs) &&
    (typeof docs.autodocs === 'boolean' || docs.autodocs === 'tag')
      ? docs.autodocs
      : undefined;
  const defaultName =
    hasProperty('defaultName')(docs) && isNonEmptyString(docs.defaultName)
      ? docs.defaultName
      : undefined;

  return {
    stories,
    ...(docs
      ? {
          docs: {
            autodocs,
            defaultName,
          },
        }
      : {}),
  } satisfies StorybookConfig;
};
