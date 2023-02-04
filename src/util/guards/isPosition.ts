import type { Position } from '../../types/Position';
import { hasProperty } from './hasProperty';

export const isPosition = (v: unknown): v is Position =>
  hasProperty('column')(v) &&
  typeof v.column === 'number' &&
  hasProperty('line')(v) &&
  typeof v.line === 'number';
