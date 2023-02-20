import { workspace } from 'vscode';
import { readConfiguration } from '../../util/getConfiguration';
import { isNonEmptyString } from '../../util/guards/isNonEmptyString';
import type { TaskCreatorOptions } from '../TaskCreatorOptions';
import { createProcessTask } from '../createProcessTask';
import { getSanitizedArgs } from '../getSanitizedArgs';

export const tryGetCustomCommandTask = ({
  configDir,
  env,
}: TaskCreatorOptions) => {
  const path = readConfiguration('server.internal.custom.path');

  if (!isNonEmptyString(path)) {
    return undefined;
  }

  const cwd = configDir
    ? workspace.getWorkspaceFolder(configDir)?.uri.fsPath
    : undefined;

  const args = getSanitizedArgs(
    readConfiguration('server.internal.custom.args'),
  );

  return createProcessTask(path, args ?? [], cwd, env);
};
