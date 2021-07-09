export const createIframeElement = () => {
  const iframe = document.createElement('iframe');

  iframe.id = 'storybook-iframe';
  iframe.allow = 'clipboard-read; clipboard-write;';
  iframe.sandbox.add('allow-same-origin', 'allow-scripts');

  return iframe;
};
