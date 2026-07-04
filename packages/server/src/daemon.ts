import { createServer } from "node:http";
import type { Logger } from "pino";

import { loadDaemonConfig, type DaemonConfig } from "./config.js";
import { loadOrCreateIdentity } from "./handshake.js";
import { createHttpApp } from "./http-app.js";
import { createLogger } from "./logger.js";
import { resolveSpannerHome, SPANNER_VERSION } from "./paths.js";
import { SpannerWebsocketServer } from "./websocket-server.js";

export interface DaemonHandle {
  config: DaemonConfig;
  logger: Logger;
  spannerHome: string;
  stop: () => Promise<void>;
  httpServer: ReturnType<typeof createServer>;
  wsServer: SpannerWebsocketServer;
}

/**
 * Boot the Spanner daemon. Resolves once the HTTP + WebSocket server is
 * listening. The returned `DaemonHandle.stop()` tears everything down cleanly.
 *
 * For a long-running daemon, call `await daemon.start()` and then keep the
 * process alive; for tests, call `daemon.stop()` in afterEach.
 */
export async function startDaemon(args?: {
  config?: Partial<DaemonConfig>;
  spannerHome?: string;
}): Promise<DaemonHandle> {
  const env = process.env;
  const config: DaemonConfig = { ...loadDaemonConfig(env), ...args?.config };
  const spannerHome = args?.spannerHome ?? resolveSpannerHome(env);
  const logger = createLogger({
    level: config.logLevel,
    ...(config.logFile ? { filePath: config.logFile } : {}),
  });
  logger.info(
    { spannerHome, listenHost: config.listenHost, listenPort: config.listenPort },
    "starting daemon",
  );

  const identity = loadOrCreateIdentity(spannerHome);
  logger.info(
    { serverId: identity.serverId, fingerprint: identity.publicKeyFingerprint },
    "identity ready",
  );

  const httpApp = createHttpApp({
    logger,
    serverVersion: SPANNER_VERSION,
    serverId: identity.serverId,
    startedAt: Date.now(),
  });

  const httpServer = createServer(httpApp);
  const wsServer = new SpannerWebsocketServer({
    httpServer,
    logger,
    identity,
    ...(config.daemonAuthToken ? { authToken: config.daemonAuthToken } : {}),
    serverVersion: SPANNER_VERSION,
  });

  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      httpServer.off("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      httpServer.off("error", onError);
      resolve();
    };
    httpServer.once("listening", onListening);
    httpServer.once("error", onError);
    httpServer.listen(config.listenPort, config.listenHost);
  });

  logger.info({ url: `http://${config.listenHost}:${config.listenPort}` }, "daemon listening");

  return {
    config,
    logger,
    spannerHome,
    httpServer,
    wsServer,
    async stop(): Promise<void> {
      logger.info("stopping daemon");
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      });
      for (const socket of wsServer.sessions.keys()) {
        try {
          socket.close();
        } catch {
          /* ignore */
        }
      }
    },
  };
}
