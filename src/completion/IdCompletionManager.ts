import { Disposable, languages } from 'vscode';
import { suggestStoryIdConfigSuffix } from '../constants/constants';
import type { StoryStore } from '../store/StoryStore';
import { SettingsWatcher } from '../util/SettingsWatcher';
import { MdxStoryIdCompletionProvider } from './MdxStoryIdCompletionProvider';
import { defaultMdxQuoteCharacters } from './defaultMdxQuoteCharacters';

export class IdCompletionManager {
  private mdxIdProvider?: MdxStoryIdCompletionProvider;
  private mdxIdRegistration?: Disposable;

  private readonly settingsWatcher = new SettingsWatcher<boolean>(
    suggestStoryIdConfigSuffix,
    () => {
      this.startIfEnabled();
    },
  );

  private constructor(private readonly storyStore: StoryStore) {
    this.startIfEnabled();
  }

  public static init(storyStore: StoryStore) {
    return new IdCompletionManager(storyStore);
  }

  public start() {
    if (!this.mdxIdProvider) {
      this.mdxIdProvider = new MdxStoryIdCompletionProvider(
        this.storyStore,
        this.settingsWatcher,
      );
      this.mdxIdRegistration = languages.registerCompletionItemProvider(
        [{ language: 'markdown' }, { language: 'mdx' }],
        this.mdxIdProvider,
        '-',
        ...defaultMdxQuoteCharacters,
      );
    }
  }

  public stop() {
    this.mdxIdProvider = undefined;

    this.mdxIdRegistration?.dispose();
    this.mdxIdRegistration = undefined;
  }

  public dispose() {
    this.stop();
    this.settingsWatcher.dispose();
  }

  private shouldEnable() {
    return true;
  }

  private startIfEnabled() {
    if (this.shouldEnable()) {
      this.start();
    } else {
      this.stop();
    }
  }
}
