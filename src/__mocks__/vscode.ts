export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3,
}

export class RelativePattern {
  public constructor(base: string, pattern: string) {
    return { base, pattern };
  }
}
