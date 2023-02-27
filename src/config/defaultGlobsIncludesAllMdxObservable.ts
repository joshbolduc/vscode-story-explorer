import { fromMinimumVersion } from '../versions/fromMinimumVersion';
import { VERSION_7_x_ALPHA } from '../versions/versions';

/**
 * Whether directory-based stories globs match all `.mdx` files by default, not
 * just those named `*.stories.mdx`.
 * @see https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#stories-glob-matches-mdx-files
 */
export const defaultGlobsIncludesAllMdxObservable =
  fromMinimumVersion(VERSION_7_x_ALPHA);
