import { ExtensionMode, OutputChannel, window } from 'vscode';
import { extensionName } from '../constants/constants';

let outputChannel: OutputChannel;
let extensionMode: ExtensionMode = ExtensionMode.Production;

export const initLogger = (mode: ExtensionMode) => {
  outputChannel = window.createOutputChannel(extensionName);
  extensionMode = mode;
};

export const getLogger = () => outputChannel;

const append = (...msg: unknown[]) => getLogger().appendLine(msg.join(' '));

const shouldLog = () => extensionMode === ExtensionMode.Production;

export const logDebug = (...msg: unknown[]) => {
  if (shouldLog()) {
    return;
  }
  console.debug(...msg);
  append('[debug]', ...msg);
};

export const logInfo = (...msg: unknown[]) => {
  if (shouldLog()) {
    return;
  }
  console.info(...msg);
  append('[info ]', ...msg);
};

export const logWarn = (...msg: unknown[]) => {
  if (shouldLog()) {
    return;
  }
  console.warn(...msg);
  append('[warn ]', ...msg);
};

export const logError = (...msg: unknown[]) => {
  if (shouldLog()) {
    return;
  }
  console.error(...msg);
  append('[error]', ...msg);
};
