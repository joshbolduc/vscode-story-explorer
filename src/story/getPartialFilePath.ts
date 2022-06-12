export const getPartialFilePath = (pathPrefix: string, uriPath: string) =>
  uriPath.slice(pathPrefix.length);
