import type { Server, ServerResponse } from 'http';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import * as httpProxy from 'http-proxy';
import { Uri } from 'vscode';
import {
  ERR_BAD_GATEWAY,
  hostScriptPath,
  iframePath,
  storyScriptPath,
} from '../../common/constants';
import { logDebug, logError, logWarn } from '../log/log';
import type { ServerManager } from '../server/ServerManager';
import { Cacheable } from '../util/Cacheable';
import { getFileContentFromFs } from '../util/getFileContent';
import storyIframeHtml from './storyIframe.html';

const respondWithScriptContents = (
  res: ServerResponse,
  scriptContent: string,
) => {
  res.writeHead(200, { 'Content-Type': 'application/javascript' });
  res.write(scriptContent);
  res.end();
};

const getScriptContents = async (extensionUri: Uri, scriptFileName: string) => {
  const scriptUri = Uri.joinPath(
    extensionUri,
    'dist',
    'webview',
    scriptFileName,
  );
  return await getFileContentFromFs(scriptUri);
};

export class ProxyServer {
  private proxy?: httpProxy;
  private server?: Server;

  private readonly cacheable = new Cacheable(async () => {
    const proxy = httpProxy.createProxyServer();
    this.proxy = proxy;

    const storyEntryScriptContent = await getScriptContents(
      this.extensionUri,
      'entry-story.js',
    );
    const hostEntryScriptContent = await getScriptContents(
      this.extensionUri,
      'entry-host.js',
    );

    const server = createServer((req, res) => {
      if (req.url === `/${iframePath}`) {
        const port = (server.address() as AddressInfo).port;

        if (!port) {
          res.writeHead(500);
        } else {
          res.writeHead(200);
          const content = storyIframeHtml.replace('{{port}}', port.toString());
          res.write(content);
        }
        res.end();
      } else if (req.url === `/${storyScriptPath}`) {
        respondWithScriptContents(res, storyEntryScriptContent);
      } else if (req.url === `/${hostScriptPath}`) {
        const requestOrigin = req.headers.origin;

        if (requestOrigin) {
          res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        }
        respondWithScriptContents(res, hostEntryScriptContent);
      } else {
        Promise.resolve(this.getProxyTarget())
          .then((target) => {
            if (target) {
              proxy.web(req, res, { target }, (e) => {
                logWarn('Failed to proxy request', e, target);
                res.writeHead(502);
                res.write(ERR_BAD_GATEWAY);
                res.end();
              });
            } else {
              res.writeHead(500);
              res.write('500: internal error');
              res.end();
            }
          })
          .catch((e) => {
            logError('Failed to respond for proxied request', e);
          });
      }
    });
    this.server = server;

    return new Promise<Server>((resolve) => {
      server.listen(0, () => {
        const addressInfo = server.address() as AddressInfo;
        logDebug(`Started proxy server on port ${addressInfo.port}`);
        resolve(server);
      });
    });
  });

  public constructor(
    private readonly serverManager: ServerManager,
    private readonly extensionUri: Uri,
  ) {}

  public async getPort() {
    const server = await this.cacheable.getResult();
    const addressInfo = server.address() as AddressInfo;

    return addressInfo.port;
  }

  public dispose() {
    this.proxy?.close();
    this.server?.close();
    this.cacheable.clear();
  }

  private getProxyTarget() {
    return this.serverManager.ensureServerHealthy();
  }
}
