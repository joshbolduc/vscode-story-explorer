export interface StoriesSpecifier {
  directory: string;
  titlePrefix?: string | undefined;
  files?: string | undefined;
}

export type StoriesConfigItem = string | StoriesSpecifier;

type ValueOrFunction<T> = T | (() => T);

type ValueOrPromise<T> = T | Promise<T>;

export type StoriesConfig = ValueOrFunction<
  ValueOrPromise<StoriesConfigItem[]>
>;

export interface StorybookConfig {
  stories: StoriesConfig;
}
