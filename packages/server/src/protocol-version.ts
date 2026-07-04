/**
 * Re-export the protocol's `SPANNER_PROTOCOL_VERSION` for server-side consumers.
 * The actual constant lives in `@echohello/protocol/messages`; this module is a
 * placeholder for any server-side protocol-version constants in the future.
 */
export { SPANNER_PROTOCOL_VERSION } from "@echohello/protocol/messages";
