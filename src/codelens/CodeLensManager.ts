import { Disposable, languages } from 'vscode';
import type { ConfigManager } from '../config/ConfigManager';
import {
  codeLensDocsEnabledConfigSuffix,
  codeLensStoriesEnabledConfigSuffix,
} from '../constants/constants';
import type { StoryStore } from '../store/StoryStore';
import { SettingsWatcher } from '../util/SettingsWatcher';
import { StoryCodeLensProvider } from './StoryCodeLensProvider';

export class CodeLensManager {
  private provider?: StoryCodeLensProvider;
  private registration?: Disposable;

  private readonly docsSettingsWatcher = new SettingsWatcher(
    codeLensDocsEnabledConfigSuffix,
    () => {
      this.refresh();
    },
  );
  private readonly storiesSettingsWatcher = new SettingsWatcher(
    codeLensStoriesEnabledConfigSuffix,
    () => {
      this.refresh();
    },
  );

  private constructor(
    private readonly storyStore: StoryStore,
    private readonly configManager: ConfigManager,
  ) {
    this.startIfEnabled();
  }

  public static init(storyStore: StoryStore, configManager: ConfigManager) {
    return new CodeLensManager(storyStore, configManager);
  }

  public dispose() {
    this.stop();

    this.docsSettingsWatcher.dispose();
    this.storiesSettingsWatcher.dispose();
  }

  private start() {
    if (this.provider) {
      return;
    }

    this.provider = StoryCodeLensProvider.init(
      this.storyStore,
      this.docsSettingsWatcher,
      this.storiesSettingsWatcher,
      this.configManager,
    );

    this.registration = languages.registerCodeLensProvider(
      [
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'javascriptreact' },
        { language: 'typescriptreact' },
        { language: 'markdown' },
        { language: 'mdx' },
      ],
      this.provider,
    );
  }

  private stop() {
    this.registration?.dispose();
    this.registration = undefined;

    this.provider?.dispose();
    this.provider = undefined;
  }

  private shouldEnable() {
    return true;
  }

  private refresh() {
    this.startIfEnabled();
    this.provider?.refresh();
  }

  private startIfEnabled() {
    if (this.shouldEnable()) {
      this.start();
    } else {
      this.stop();
    }
  }
}
