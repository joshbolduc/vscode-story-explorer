import type { Uri } from 'vscode';
import { pathDepthCompareFn } from '../util/pathDepthCompareFn';
import { strCompareFn } from '../util/strCompareFn';
import { extensionCompareFn } from './extensionCompareFn';

export interface ConfigLocation {
  file: Uri;
  dir: Uri;
  relativePath: string;
}

export const configLocationCompareFn = (a: ConfigLocation, b: ConfigLocation) =>
  pathDepthCompareFn(a.relativePath, b.relativePath) ||
  extensionCompareFn(a.file.path, b.file.path) ||
  strCompareFn(a.relativePath, b.relativePath);
