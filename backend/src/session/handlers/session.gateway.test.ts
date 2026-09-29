import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fakeRequest,
  fakeSocket,
  participantAuth,
  tokenRequest,
} from "../../../test/fakes";
import { EventBus } from "../../common/events/event-bus";
import { SessionNotFoundException } from "../exceptions/not-found";
import type { SessionService } from "../services/session.service";
import { SessionGateway } from "./session.gateway";

let eventBus: EventBus;
let service: {
  assertValidSession: ReturnType<typeof mock>;
  connect: ReturnType<typeof mock>;
  disconnect: ReturnType<typeof mock>;
};
let gateway: SessionGateway;

beforeEach(() => {
  eventBus = new EventBus();
  service = { assertValidSession: mock(), connect: mock(), disconnect: mock() };
  gateway = new SessionGateway(
    service as unknown as SessionService,
    participantAuth,
    eventBus,
  );
});

describe("connection", () => {
  test("a participant connects with their token", () => {
    gateway.handleConnection(fakeSocket(), tokenRequest("123456", "Ann"));
    expect(service.assertValidSession).toHaveBeenCalledWith("123456");
    expect(service.connect).toHaveBeenCalledWith("123456", "Ann");
  });

  test("the host connects with the session code", () => {
    gateway.handleConnection(fakeSocket(), fakeRequest("code=123456"));
    expect(service.connect).toHaveBeenCalledWith("123456", undefined);
  });

  test("an invalid token closes with 4401", () => {
    const socket = fakeSocket();
    gateway.handleConnection(socket, fakeRequest("token=bad"));
    expect(socket.close).toHaveBeenCalledWith(4401, "Invalid token");
    expect(service.connect).not.toHaveBeenCalled();
  });

  test("a session error closes with 4000 + its HTTP status", () => {
    service.assertValidSession.mockImplementation(() => {
      throw new SessionNotFoundException("123456");
    });
    const socket = fakeSocket();
    gateway.handleConnection(socket, fakeRequest("code=123456"));
    expect(socket.close).toHaveBeenCalledWith(4404, "Session 123456 not found");
    expect(service.connect).not.toHaveBeenCalled();
  });
});

describe("disconnection", () => {
  test("disconnects the participant", () => {
    const socket = fakeSocket();
    gateway.handleConnection(socket, tokenRequest("123456", "Ann"));
    gateway.handleDisconnect(socket);
    expect(service.disconnect).toHaveBeenCalledWith("123456", "Ann");
  });

  test("ignores sockets that were rejected", () => {
    const socket = fakeSocket();
    gateway.handleConnection(socket, fakeRequest("token=bad"));
    gateway.handleDisconnect(socket);
    expect(service.disconnect).not.toHaveBeenCalled();
  });
});

test("ending a session closes only its sockets", () => {
  const ann = fakeSocket();
  const other = fakeSocket();
  gateway.handleConnection(ann, tokenRequest("123456", "Ann"));
  gateway.handleConnection(other, tokenRequest("654321", "Bob"));

  eventBus.emit("session.ended", "123456");
  expect(ann.close).toHaveBeenCalledWith(4410, "Session ended");
  expect(other.close).not.toHaveBeenCalled();
});
