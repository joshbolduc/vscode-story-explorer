import type { Location } from '../types/Location';

export interface Story {
  location: Location | undefined;
  name: string;
  nameForId: string | undefined;
}
