import { firstValueFrom } from 'rxjs';
import type { Uri } from 'vscode';
import { supportLooseStoryNameSemantics } from '../config/supportLegacyStoryNameProperty';
import { logDebug } from '../log/log';
import { getFileContent } from '../util/getFileContent';
import { parseStoriesFile } from './parseStoriesFile';

export type ParsedStoryWithFileUri = NonNullable<
  ReturnType<typeof parseStoriesFile>
> & {
  file: Uri;
};

export const parseStoriesFileByUri = async (
  storiesFile: Uri,
): Promise<ParsedStoryWithFileUri | undefined> => {
  const contents = await getFileContent(storiesFile);

  const useLooseStoryNameSemantics = await firstValueFrom(
    supportLooseStoryNameSemantics,
  );

  const parsed = parseStoriesFile(
    contents,
    { useLooseStoryNameSemantics },
    storiesFile.path,
  );

  if (!parsed) {
    // Most likely due to transient syntax error
    logDebug('Failed to parse file', storiesFile);
    return undefined;
  }

  return { ...parsed, file: storiesFile };
};
