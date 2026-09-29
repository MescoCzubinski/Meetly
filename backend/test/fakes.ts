import type { IncomingMessage } from "node:http";
import { mock } from "bun:test";
import { JwtService } from "@nestjs/jwt";
import type { WebSocket } from "ws";
import { ParticipantAuth } from "../src/common/auth/participant-auth";

export const participantAuth = new ParticipantAuth(
  new JwtService({ secret: "secret" }),
);

export type FakeSocket = WebSocket & {
  send: ReturnType<typeof mock>;
  close: ReturnType<typeof mock>;
};

export function fakeSocket() {
  return { send: mock(), close: mock() } as unknown as FakeSocket;
}

export function fakeRequest(query: string) {
  return { url: `/?${query}` } as IncomingMessage;
}

export function tokenRequest(code: string, name: string) {
  return fakeRequest(`token=${participantAuth.sign({ code, name })}`);
}

export function sent(socket: FakeSocket) {
  return socket.send.mock.calls.map(([raw]) => JSON.parse(raw));
}
