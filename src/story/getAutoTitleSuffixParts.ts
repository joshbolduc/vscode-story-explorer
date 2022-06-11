export const getAutoTitleSuffixParts = (partialFilePath: string) => {
  const partialFilePathParts = partialFilePath.split('/');

  const filename = partialFilePathParts[partialFilePathParts.length - 1] ?? '';
  const dirParts = partialFilePathParts.slice(0, -1);
  const immediateDirname = dirParts[dirParts.length - 1];

  const extensionIndex = filename.indexOf('.');
  const filenameWithoutExtension =
    extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;

  const filenameIsRedundant =
    filenameWithoutExtension === 'index' ||
    filenameWithoutExtension === immediateDirname;

  return filenameIsRedundant
    ? dirParts
    : [...dirParts, filenameWithoutExtension];
};
