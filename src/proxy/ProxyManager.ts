import type { Uri } from 'vscode';
import type { ServerManager } from '../server/ServerManager';
import { Cacheable } from '../util/Cacheable';
import { ProxyServer } from './ProxyServer';

export class ProxyManager {
  private proxyServer?: ProxyServer;

  private readonly proxyServerCacheable = new Cacheable(() => {
    this.proxyServer = new ProxyServer(this.serverManager, this.extensionUri);

    return this.proxyServer;
  });

  private constructor(
    private readonly serverManager: ServerManager,
    private readonly extensionUri: Uri,
  ) {}

  public static init(serverManager: ServerManager, extensionUri: Uri) {
    return new ProxyManager(serverManager, extensionUri);
  }

  public ensureProxyServer() {
    return this.proxyServerCacheable.getResult();
  }

  /**
   * Returns the port used by the proxy server, starting it if necessary.
   *
   * @returns The port of the proxy server
   */
  public getProxyServerPort() {
    return this.ensureProxyServer().getPort();
  }

  public dispose() {
    this.ensureProxyServer().dispose();
    this.proxyServer?.dispose();
    this.proxyServerCacheable.clear();
  }
}
