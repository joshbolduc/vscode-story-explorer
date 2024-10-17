import { ERR_BAD_GATEWAY } from '../common/constants';
import type { Message } from '../common/messaging';
import { MessageType } from '../common/messaging';
import { createIframeElement } from './createIframeElement';

const storybookBgColor = 'rgb(246, 249, 252)';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- ancestor origin expected to exist
const getParentOrigin = () => window.location.ancestorOrigins[0]!;

const sendMessage = (message: Message) => {
  window.parent.postMessage(message, getParentOrigin());
};

const handleIframeWindowError = (e: ErrorEvent): void => {
  // Catch cross-origin issues, as triggered by actions addon and other code
  // that isn't cross-origin-safe.
  // React also fires a follow-up exception so we kind of need to swallow that
  // too, but it's harder to identify safely.
  e.preventDefault();
  e.stopImmediatePropagation();
};

const createIframe = (storyId: string, storyType: string) => {
  const iframe = createIframeElement();

  const handleIframeLoad = () => {
    const iframeContent = iframe.contentWindow?.document.body.innerText;

    if (iframeContent === ERR_BAD_GATEWAY) {
      sendMessage({ type: MessageType.SetErrorState });
    }

    sendMessage({ type: MessageType.FrameLoaded });
  };

  iframe.addEventListener('load', handleIframeLoad);

  // For docs, we (sometimes) rely on storybook figuring out the full ID for us,
  // which requires the full story store to be loaded. (Investigate whether this
  // is also needed to support <Story /> elements that reference other stories,
  // in which case we really can't use `singleStory` for docs.)
  const useSingleStory = storyType === 'story';
  const storyIdParam = encodeURIComponent(storyId);
  const viewMode = encodeURIComponent(storyType);

  const src = useSingleStory
    ? `/?path=/story/${storyIdParam}&viewMode=${viewMode}&singleStory=true`
    : `/iframe.html?id=${storyIdParam}&viewMode=${viewMode}`;

  iframe.src = src;

  return iframe;
};

const handleLoad = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const storyId = params.get('storyId');
  const storyType = params.get('storyType');

  const sbIframe = createIframe(storyId ?? '', storyType ?? 'story');

  document.body.style.backgroundColor = storybookBgColor;
  document.body.appendChild(sbIframe);

  sbIframe.contentWindow?.addEventListener('error', handleIframeWindowError);
};

addEventListener('load', handleLoad);
