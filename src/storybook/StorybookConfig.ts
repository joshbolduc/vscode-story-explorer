export interface StoriesSpecifier {
  directory: string;
  titlePrefix?: string | undefined;
  files?: string | undefined;
}

export type StoriesConfigItem = string | StoriesSpecifier;

export interface StorybookConfig {
  stories: StoriesConfigItem[];
  docs?: {
    autodocs?: boolean | 'tag' | undefined;
    defaultName?: string | undefined;
  };
}
