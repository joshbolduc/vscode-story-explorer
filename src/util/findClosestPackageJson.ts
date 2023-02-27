import type { Uri } from 'vscode';
import { findClosestFile } from './findClosestFile';

export const findClosestPackageJson = (startingDir: Uri) =>
  findClosestFile(['package.json'], startingDir);
