import type { IncomingMessage } from "node:http";
import { mock } from "bun:test";
import type { ExecutionContext } from "@nestjs/common";
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

export const fakeSocket = () => {
  return { send: mock(), close: mock() } as unknown as FakeSocket;
};

export const fakeRequest = (query: string) => {
  return { url: `/?${query}` } as IncomingMessage;
};

export const tokenRequest = (code: string, name: string) => {
  return fakeRequest(`token=${participantAuth.sign({ code, name })}`);
};

export const wsContext = (
  handler: (...args: never[]) => unknown,
  client: object,
) =>
  ({
    getHandler: () => handler,
    switchToWs: () => ({ getClient: () => client }),
  }) as unknown as ExecutionContext;

export const sent = (socket: FakeSocket) => {
  return socket.send.mock.calls.map(([raw]) => JSON.parse(raw));
};
