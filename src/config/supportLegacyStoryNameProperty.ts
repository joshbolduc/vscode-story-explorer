import { fromPriorVersion } from '../versions/fromPriorVersion';
import { VERSION_7_x_ALPHA } from '../versions/versions';

/**
 * Whether to use looser story name override semantics, as used in SB 6 (but not
 * SB 7).
 * @see https://github.com/storybookjs/storybook/issues/17548
 */
export const supportLooseStoryNameSemantics =
  fromPriorVersion(VERSION_7_x_ALPHA);
