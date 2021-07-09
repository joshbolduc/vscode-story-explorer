import { ColorThemeKind, ExtensionContext, Uri, window } from 'vscode';

export type IconName = 'bookmark' | 'component' | 'document' | 'folder';

const getIconThemeDir = () =>
  window.activeColorTheme.kind === ColorThemeKind.Light ? 'light' : 'dark';

export const getIconPath = (
  iconName: IconName,
  context: ExtensionContext,
  iconTheme?: 'light' | 'dark',
) => {
  return Uri.joinPath(
    context.extensionUri,
    'icons',
    iconTheme ?? getIconThemeDir(),
    `${iconName}.svg`,
  );
};
