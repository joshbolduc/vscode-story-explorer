import type { IncomingMessage } from 'http';
import { ProgressLocation, window } from 'vscode';
import type { ConfigManager } from '../config/ConfigManager';
import { internalServerRunningContext } from '../constants/constants';
import { logDebug, logError, logInfo } from '../log/log';
import { Cacheable } from '../util/Cacheable';
import { Mailbox } from '../util/Mailbox';
import { getWorkspaceRoot } from '../util/getWorkspaceRoot';
import { poll } from '../util/poll';
import { setContext } from '../util/setContext';
import { TaskExecutor } from './TaskExecutor';
import { createTask } from './createTask';
import { fetch, TimeoutError } from './fetch';
import { getStorybookBinPath } from './getStorybookBinPath';
import { pollForPort } from './pollForPort';

export class StorybookServer {
  private readonly taskExecutor = new TaskExecutor(
    () => this.createTask(),
    ({ processId }) => {
      // This approach assumes that the launched process is the development
      // server. If this process opens multiple ports or spawns another process
      // that's the actual server, this won't work.
      pollForPort(processId)
        .then((port) => {
          const url = `http://localhost:${port}`;
          this.urlMailbox.put(url);
        })
        .catch((err) => {
          logError('Failed to determine Storybook server port', err);
          this.stop();
        });
    },
    ({ exitCode }) => {
      this.cleanupAfterTaskExit();

      if (exitCode !== 0) {
        const itemRelaunch = 'Relaunch';
        window
          .showErrorMessage(
            'The Storybook server terminated unexpectedly.',
            itemRelaunch,
          )
          .then(
            (choice) => {
              if (choice === itemRelaunch) {
                return this.ensureServerHealthy();
              }
            },
            (e) => {
              logError(
                'Failed to handle Storybook server relaunch error message',
                e,
              );
            },
          );
      }
    },
  );

  private readonly urlMailbox = new Mailbox<string>();

  private readonly healthyCacheable = new Cacheable(async () => {
    return window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Starting Storybook Server',
        cancellable: true,
      },
      async (progress, token) => {
        progress.report({ message: 'Launching' });
        if (token.isCancellationRequested) {
          this.stop();
          return;
        }

        setContext(internalServerRunningContext, true);
        await this.taskExecutor.start(token);

        const url = await this.urlMailbox.get();

        if (token.isCancellationRequested) {
          this.stop();
          return;
        }

        progress.report({ message: 'Waiting for server to be ready' });

        try {
          const finalResponse = await poll<IncomingMessage, undefined>(
            async () => {
              try {
                return await fetch(url, token);
              } catch (e: unknown) {
                if (e instanceof TimeoutError) {
                  logDebug('Caught timeout error');
                  return;
                }
                throw e;
              }
            },
            500,
            (response): response is undefined => {
              if (!response?.statusCode) {
                logInfo('No response from server; retrying');
                return true;
              }

              logInfo(`Got HTTP status ${response.statusCode} from server`);
              return response.statusCode === 404;
            },
          );

          if (token.isCancellationRequested) {
            this.stop();
            return;
          }

          if (finalResponse.statusCode !== 200) {
            throw new Error(
              `Unexpected server status ${
                finalResponse.statusCode ?? '[none]'
              }`,
            );
          }

          return url;
        } catch (e) {
          this.stop();
          return;
        }
      },
    );
  });

  public constructor(private readonly configManager: ConfigManager) {}

  public stop() {
    this.taskExecutor.stop();

    // Cleanup now (synchronously)
    this.cleanupAfterTaskExit();
  }

  public async ensureServerHealthy() {
    return this.healthyCacheable.getResult();
  }

  public dispose() {
    this.stop();
    this.urlMailbox.dispose();
    this.taskExecutor.dispose();
  }

  private async createTask() {
    const binPath = await getStorybookBinPath();
    const cwd = getWorkspaceRoot();
    const configDirPath = this.configManager.getConfigDir()?.path;

    if (!binPath) {
      return undefined;
    }

    return createTask(binPath, cwd, configDirPath);
  }

  private readonly cleanupAfterTaskExit = () => {
    setContext(internalServerRunningContext, false);

    this.healthyCacheable.clear();
    this.urlMailbox.clear();
    this.taskExecutor.stop();
  };
}
