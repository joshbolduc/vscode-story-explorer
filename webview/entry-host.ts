import { Message, MessageType } from '../common/messaging';
import { createIframeElement } from './createIframeElement';
import errorHtml from './error.html';
import { listen } from './listen';

const vscode = acquireVsCodeApi();

let _iframe: HTMLIFrameElement | undefined;
let storyInfo: { storyId: string; storyType: 'story' | 'docs' };

const ensureIframe = () => {
  if (!_iframe) {
    _iframe = createIframeElement();
  }

  return _iframe;
};

const handleExtensionHostMessage = (hostMessage: Message): void => {
  switch (hostMessage.type) {
    case MessageType.SetStoryInfo: {
      const { storyId, storyType } = hostMessage;
      storyInfo = { storyId, storyType };

      vscode.setState({ storyId });

      break;
    }
    case MessageType.LoadStory: {
      const { port, storybookUrl } = hostMessage;
      const { storyId, storyType } = storyInfo;

      const iframeSrc = `http://localhost:${Number(
        port,
      )}/__vscode_story_explorer_iframe#storyId=${encodeURIComponent(
        storyId,
      )}&storyType=${encodeURIComponent(storyType)}`;

      const iframeUrl = new URL(iframeSrc);
      const innerIframeOrigin = iframeUrl.origin;

      const handleIframeMessage = (iframeMessage: Message): void => {
        switch (iframeMessage.type) {
          case MessageType.FrameLoaded: {
            const loadingContainer =
              document.getElementById('loading-container');
            if (loadingContainer) {
              loadingContainer.style.display = 'none';
            }
            iframe.style.visibility = 'visible';
            break;
          }
          case MessageType.SetErrorState:
            document.body.innerHTML = errorHtml.replace(
              /{{storybookUrl}}/g,
              new URL(storybookUrl).href,
            );

            iframe.remove();
            stopListener();
            break;
        }
      };

      const stopListener = listen(innerIframeOrigin, handleIframeMessage);

      const iframe = ensureIframe();
      iframe.src = iframeSrc;
      iframe.style.visibility = 'hidden';

      document.body.appendChild(iframe);

      break;
    }
  }
};

const handleLoad = () => {
  const webviewHostOrigin = window.origin;

  listen(webviewHostOrigin, handleExtensionHostMessage);

  vscode.postMessage({
    type: MessageType.Ready,
  });
};

addEventListener('load', handleLoad);
