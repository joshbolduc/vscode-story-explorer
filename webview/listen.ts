import type { Message } from '../common/messaging';

export const listen = (
  origin: string,
  callback: (message: Message) => void,
) => {
  const handleMessage = (e: MessageEvent<Message>) => {
    if (e.origin !== origin) {
      console.warn(
        'webview: Ignoring message from unexpected origin',
        e.origin,
        origin,
      );
      return;
    }

    const message = e.data;

    callback(message);
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
};
