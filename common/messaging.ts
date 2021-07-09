export enum MessageType {
  /**
   * The host webview is ready to receive messages from the extension host. Sent
   * from host webview to extension host.
   */
  Ready,
  /**
   * The story webview has encountered an error that should prompt an error
   * message. Sent from the story webview to the host webview.
   */
  SetErrorState,
  /**
   * A message that a story should be loaded. Sent from the extension host to
   * the host webview.
   */
  LoadStory,
  /**
   * Metadata about a story to be loaded. Sent from the extension host to the
   * host webview.
   */
  SetStoryInfo,
  /**
   * The story webview's iframe has finished loading and is ready to be
   * displayed. Sent from the story webview to the host webview.
   */
  FrameLoaded,
}

/**
 * The host webview is ready to receive messages from the extension host. Sent
 * from host webview to extension host.
 */
export interface ReadyMessage {
  type: MessageType.Ready;
}

/**
 * The story webview has encountered an error that should prompt an error
 * message. Sent from the story webview to the host webview.
 */
export interface SetErrorStateMessage {
  type: MessageType.SetErrorState;
}

/**
 * Metadata about a story to be loaded. Sent from the extension host to the host
 * webview.
 */
export interface SetStoryInfoMessage {
  type: MessageType.SetStoryInfo;
  /**
   * The ID of the story to be loaded.
   */
  storyId: string;
  /**
   * The type of the story to be loaded.
   */
  storyType: 'story' | 'docs';
}

/**
 * A message that a story should be loaded. Sent from the extension host to the
 * host webview.
 */
export interface LoadStoryMessage {
  type: MessageType.LoadStory;
  /**
   * The port of the proxy server to use to load the story.
   */
  port: number;
  /**
   * The host URL that the proxy server proxies. Used for error messaging if the
   * proxy fails.
   */
  storybookUrl: string;
  /**
   * Whether the proxy server is proxying access to an internally-managed
   * server.
   */
  isInternalServer: boolean;
}

/**
 * The story webview's iframe has finished loading and is ready to be displayed.
 * Sent from the story webview to the host webview.
 */
export interface FrameLoadedMessage {
  type: MessageType.FrameLoaded;
}

export type Message =
  | ReadyMessage
  | SetErrorStateMessage
  | LoadStoryMessage
  | SetStoryInfoMessage
  | FrameLoadedMessage;
