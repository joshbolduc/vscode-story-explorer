import { Disposable, languages } from 'vscode';
import { suggestTitleConfigSuffix } from '../constants/constants';
import type { StoryStore } from '../store/StoryStore';
import { SettingsWatcher } from '../util/SettingsWatcher';
import { CsfTitleCompletionProvider } from './CsfTitleCompletionProvider';
import { MdxTitleCompletionProvider } from './MdxTitleCompletionProvider';
import { defaultCsfQuoteCharacters } from './defaultCsfQuoteCharacters';
import { defaultMdxQuoteCharacters } from './defaultMdxQuoteCharacters';

export class TitleCompletionManager {
  private csfProvider?: CsfTitleCompletionProvider;
  private csfRegistration?: Disposable;

  private mdxProvider?: MdxTitleCompletionProvider;
  private mdxRegistration?: Disposable;

  private readonly settingsWatcher = new SettingsWatcher(
    suggestTitleConfigSuffix,
    () => {
      this.startIfEnabled();
    },
  );

  private constructor(private readonly storyStore: StoryStore) {
    this.startIfEnabled();
  }

  public static init(storyStore: StoryStore) {
    return new TitleCompletionManager(storyStore);
  }

  public start() {
    if (!this.csfProvider) {
      this.csfProvider = new CsfTitleCompletionProvider(this.storyStore);
      this.csfRegistration = languages.registerCompletionItemProvider(
        [
          { language: 'javascript' },
          { language: 'typescript' },
          { language: 'javascriptreact' },
          { language: 'typescriptreact' },
        ],
        this.csfProvider,
        '/',
        ...defaultCsfQuoteCharacters,
      );
    }

    if (!this.mdxProvider) {
      this.mdxProvider = new MdxTitleCompletionProvider(this.storyStore);
      this.mdxRegistration = languages.registerCompletionItemProvider(
        [{ language: 'markdown' }, { language: 'mdx' }],
        this.mdxProvider,
        '/',
        ...defaultMdxQuoteCharacters,
      );
    }
  }

  public stop() {
    this.csfProvider = undefined;

    this.csfRegistration?.dispose();
    this.csfRegistration = undefined;

    this.mdxProvider = undefined;

    this.mdxRegistration?.dispose();
    this.mdxRegistration = undefined;
  }

  public dispose() {
    this.stop();
    this.settingsWatcher.dispose();
  }

  private shouldEnable() {
    return this.settingsWatcher.read() !== false;
  }

  private startIfEnabled() {
    if (this.shouldEnable()) {
      this.start();
    } else {
      this.stop();
    }
  }
}
