import type { Webview } from 'vscode';
import type { Message } from '../../common/messaging';

export type Messenger = ReturnType<typeof createMessenger>;

export const createMessenger = (webview: Webview) => {
  const send = (message: Message) => {
    return webview.postMessage(message);
  };

  return { send };
};
