export const splitKind = (kind: string) =>
  kind.split('/').map((segment) => segment.trim());
