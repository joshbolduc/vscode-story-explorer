import type { Location } from '../types/Location';

export interface Story {
  location: Location | undefined;
  name: string;
  /**
   * The name to use for story ID generation purposes, if not the regular name.
   * Used, e.g., for the export name for CSF stories and for MDX Story elements
   * with a `story` prop.
   */
  nameForId: string | undefined;
}
