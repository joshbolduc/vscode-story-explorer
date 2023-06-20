import type { Disposable, OutputChannel } from 'vscode';
import { ExtensionMode, window } from 'vscode';
import { extensionName, logLevelConfigSuffix } from '../constants/constants';
import { SettingsWatcher } from '../util/SettingsWatcher';

enum LogLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}

const logLevelStringMap = {
  none: LogLevel.None,
  error: LogLevel.Error,
  warn: LogLevel.Warn,
  info: LogLevel.Info,
  debug: LogLevel.Debug,
} as const;

const defaultLogLevel = LogLevel.Error;

let outputChannel: OutputChannel;
let extensionMode: ExtensionMode = ExtensionMode.Production;
let configuredLogLevel: LogLevel = defaultLogLevel;

const getLogLevelFromString = (str: string | undefined) => {
  const key = str?.toLowerCase();

  return key && key in logLevelStringMap
    ? logLevelStringMap[key as keyof typeof logLevelStringMap]
    : defaultLogLevel;
};

export const initLogger = (mode: ExtensionMode): Disposable => {
  outputChannel = window.createOutputChannel(extensionName);
  extensionMode = mode;

  const logLevelSettingsWatcher = new SettingsWatcher<string>(
    logLevelConfigSuffix,
    (watcher) => {
      configuredLogLevel = getLogLevelFromString(watcher.read());
    },
  );

  return {
    dispose: () => {
      logLevelSettingsWatcher.dispose();
      outputChannel.dispose();
    },
  };
};

export const getLogger = () => outputChannel;

const stringify = (item: unknown) => {
  if (item instanceof Error) {
    return `${item.name}: ${item.message}${
      item.stack ? `\n${item.stack}\n` : ''
    }`;
  }

  if (typeof item === 'object' && String(item) === '[object Object]') {
    try {
      return JSON.stringify(item);
    } catch {
      // fall through
    }
  }

  return item;
};

const append = (...msg: unknown[]) =>
  getLogger().appendLine(msg.map(stringify).join(' '));

const shouldLog = (level: LogLevel) =>
  extensionMode === ExtensionMode.Development || level <= configuredLogLevel;

export const logDebug = (...msg: unknown[]) => {
  if (!shouldLog(LogLevel.Debug)) {
    return;
  }
  console.debug(...msg);
  append('[debug]', ...msg);
};

export const logInfo = (...msg: unknown[]) => {
  if (!shouldLog(LogLevel.Info)) {
    return;
  }
  console.info(...msg);
  append('[info ]', ...msg);
};

export const logWarn = (...msg: unknown[]) => {
  if (!shouldLog(LogLevel.Warn)) {
    return;
  }
  console.warn(...msg);
  append('[warn ]', ...msg);
};

export const logError = (...msg: unknown[]) => {
  if (!shouldLog(LogLevel.Error)) {
    return;
  }
  console.error(...msg);
  append('[error]', ...msg);
};
