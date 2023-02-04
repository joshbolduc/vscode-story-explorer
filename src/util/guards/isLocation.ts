import type { Location } from '../../types/Location';
import { hasProperty } from './hasProperty';
import { isPosition } from './isPosition';

export const isLocation = (v: unknown): v is Location =>
  hasProperty('end')(v) &&
  isPosition(v.end) &&
  hasProperty('start')(v) &&
  isPosition(v.start);
