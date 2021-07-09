import { makeFullConfigName } from '../util/makeFullConfigName';

export const extensionName = 'Story Explorer';

export const internalServerRunningContext =
  'storyExplorer.internalServerRunning';
export const storybookConfigDetectedContext =
  'storyExplorer.storybookConfigDetected';
export const storybookPreviewFocusedContext =
  'storyExplorer.storybookPreviewFocused';
export const storybookWebviewsOpenContext =
  'storyExplorer.storybookWebviewsOpen';

export const storyTreeViewId = 'storyExplorer.storiesView';

export const goToStorySourceCommand = 'storyExplorer.goToStorySource';
export const openPreviewCommand = 'storyExplorer.openPreview';
export const openPreviewInBrowserCommand = 'storyExplorer.openPreviewInBrowser';
export const openPreviewToSideCommand = 'storyExplorer.openPreviewToSide';
export const openStorybookConfigCommand = 'storyExplorer.openStorybookConfig';
export const openStorybookConfigDirSettingCommand =
  'storyExplorer.openStorybookConfigDirSetting';
export const openStorybookInBrowserCommand =
  'storyExplorer.openStorybookInBrowser';
export const openStorybookUrlSettingCommand =
  'storyExplorer.openStorybookUrlSetting';
export const refreshAllWebviewsCommand = 'storyExplorer.refreshAllWebviews';
export const refreshWebviewCommand = 'storyExplorer.refreshWebview';
export const restartStorybookServerCommand =
  'storyExplorer.restartStorybookServer';
export const startStorybookServerCommand = 'storyExplorer.startStorybookServer';
export const stopStorybookServerCommand = 'storyExplorer.stopStorybookServer';

export const webviewPreviewViewType = 'storyExplorer.webviewPreview';

export const configPrefix = 'storyExplorer';

export const codeLensDocsEnabledConfigSuffix = 'codeLens.docs.enabled';
export const codeLensStoriesEnabledConfigSuffix = 'codeLens.stories.enabled';
export const serverExternalUrlConfigSuffix = 'server.external.url';
export const serverInternalBehaviorConfigSuffix = 'server.internal.behavior';
export const serverInternalEnabledConfigSuffix = 'server.internal.enabled';
export const serverInternalEnvironmentVariablesConfigSuffix =
  'server.internal.environmentVariables';
export const serverInternalStorybookBinaryPathConfigSuffix =
  'server.internal.storybookBinaryPath';
export const storiesViewShowItemsWithoutStoriesConfigSuffix =
  'storiesView.showItemsWithoutStories';
export const storybookConfigDirConfigSuffix = 'storybookConfigDir';
export const suggestStoryIdConfigSuffix = 'suggestStoryId';
export const suggestTitleConfigSuffix = 'suggestTitle';

export const serverExternalUrlConfig = makeFullConfigName(
  serverExternalUrlConfigSuffix,
);
export const serverInternalStorybookBinaryPathConfig = makeFullConfigName(
  serverInternalStorybookBinaryPathConfigSuffix,
);
export const storybookConfigDirConfig = makeFullConfigName(
  storybookConfigDirConfigSuffix,
);
