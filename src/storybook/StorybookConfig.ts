export type StoriesConfig =
  | string[]
  | Promise<string[]>
  | (() => string[])
  | (() => Promise<string[]>);

export interface StorybookConfig {
  stories: StoriesConfig;
}
