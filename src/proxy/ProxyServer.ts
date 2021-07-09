import { readFileSync } from 'fs';
import { createServer, Server, ServerResponse } from 'http';
import type { AddressInfo } from 'net';
import { resolve as pathResolve } from 'path';
import * as httpProxy from 'http-proxy';
import {
  ERR_BAD_GATEWAY,
  hostScriptPath,
  iframePath,
  storyScriptPath,
} from '../../common/constants';
import { logError, logWarn } from '../log/log';
import type { ServerManager } from '../server/ServerManager';

import { Cacheable } from '../util/Cacheable';
import storyIframeHtml from './storyIframe.html';

const webviewScriptDir = pathResolve(__dirname, '..', 'webview');

const respondWithScriptContents = (
  res: ServerResponse,
  scriptFilePath: string,
) => {
  const scriptContent = readFileSync(scriptFilePath);

  res.writeHead(200, { 'Content-Type': 'application/javascript' });
  res.write(scriptContent);
  res.end();
};

export class ProxyServer {
  private proxy?: httpProxy;
  private server?: Server;

  private readonly cacheable = new Cacheable(() => {
    const proxy = httpProxy.createProxyServer();
    this.proxy = proxy;

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
        const scriptFilePath = pathResolve(webviewScriptDir, 'entry-story.js');
        respondWithScriptContents(res, scriptFilePath);
      } else if (req.url === `/${hostScriptPath}`) {
        const scriptFilePath = pathResolve(webviewScriptDir, 'entry-host.js');
        const requestOrigin = req.headers.origin;

        if (requestOrigin) {
          res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        }
        respondWithScriptContents(res, scriptFilePath);
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
        resolve(server);
      });
    });
  });

  public constructor(private readonly serverManager: ServerManager) {}

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
