import type { ValueOrPromise } from '../util/ValueOrPromise';

export interface StoriesSpecifier {
  directory: string;
  titlePrefix?: string | undefined;
  files?: string | undefined;
}

export type StoriesConfigItem = string | StoriesSpecifier;

type ValueOrFunction<T> = T | (() => T);

export type StoriesConfig = ValueOrFunction<
  ValueOrPromise<StoriesConfigItem[]>
>;

export interface StorybookConfig {
  stories: StoriesConfig;
  docs?: {
    autodocs?: boolean | 'tag';
    defaultName?: string;
  };
}
