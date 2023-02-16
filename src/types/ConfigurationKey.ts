import type { ExtensionManifest } from './ExtensionManifest';

export type ConfigurationKey =
  keyof ExtensionManifest['contributes']['configuration']['properties'];
