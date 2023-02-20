import type { Uri } from 'vscode';
import type { EnvironmentVariables } from './EnvironmentVariables';

export interface TaskCreatorOptions {
  configDir: Uri | undefined;
  env: EnvironmentVariables;
}
