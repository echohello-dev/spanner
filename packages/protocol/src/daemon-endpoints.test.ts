import { describe, expect, it } from "vitest";
import { buildRelayWebSocketUrl } from "../src/daemon-endpoints.js";

describe("buildRelayWebSocketUrl", () => {
  it("infers wss when endpoint ends with :443", () => {
    expect(buildRelayWebSocketUrl({ endpoint: "relay.spanner.run:443" })).toBe(
      "wss://relay.spanner.run:443/",
    );
  });

  it("honors explicit useTls=false", () => {
    expect(
      buildRelayWebSocketUrl({
        endpoint: "relay.spanner.run:8080",
        useTls: false,
      }),
    ).toBe("ws://relay.spanner.run:8080/");
  });

  it("appends a path when given", () => {
    expect(
      buildRelayWebSocketUrl({
        endpoint: "relay.spanner.run:443",
        path: "/ws",
      }),
    ).toBe("wss://relay.spanner.run:443/ws");
  });

  it("throws on an empty endpoint", () => {
    expect(() => buildRelayWebSocketUrl({ endpoint: "" })).toThrow();
  });
});
