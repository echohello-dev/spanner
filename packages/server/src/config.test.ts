import { describe, expect, it } from "vitest";
import { loadDaemonConfig } from "../src/config.js";

describe("loadDaemonConfig", () => {
  it("returns defaults when no env vars are set", () => {
    const cfg = loadDaemonConfig({});
    expect(cfg.listenHost).toBe("127.0.0.1");
    expect(cfg.listenPort).toBe(6767);
    expect(cfg.logLevel).toBe("info");
    expect(cfg.relayEnabled).toBe(false);
    expect(cfg.appBaseUrl).toBe("https://app.spanner.run");
  });

  it("parses env overrides", () => {
    const cfg = loadDaemonConfig({
      SPANNER_LISTEN_PORT: "9999",
      SPANNER_RELAY_ENABLED: "true",
      SPANNER_RELAY_ENDPOINT: "relay.example.com:443",
      SPANNER_AUTH_TOKEN: "secret",
    });
    expect(cfg.listenPort).toBe(9999);
    expect(cfg.relayEnabled).toBe(true);
    expect(cfg.relayEndpoint).toBe("relay.example.com:443");
    expect(cfg.daemonAuthToken).toBe("secret");
  });

  it("rejects invalid log levels", () => {
    expect(() => loadDaemonConfig({ SPANNER_LOG_LEVEL: "loud" })).toThrow();
  });
});
