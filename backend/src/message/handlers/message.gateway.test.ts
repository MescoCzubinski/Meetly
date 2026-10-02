import { beforeEach, describe, expect, mock, test } from "bun:test";
import { WsException } from "@nestjs/websockets";
import {
  fakeRequest,
  fakeSocket,
  participantAuth,
  sent,
  tokenRequest,
} from "../../../test/fakes";
import { EventBus } from "../../common/events/event-bus";
import type { MessageService } from "../services/message.service";
import { MessageGateway } from "./message.gateway";

const message = { from: "Ann", to: "Bob", text: "hi", sentAt: 1 };

let eventBus: EventBus;
let service: Record<
  "isActive" | "isRegistered" | "send" | "getFor",
  ReturnType<typeof mock>
>;
let gateway: MessageGateway;

function connect(name: string, code = "123456") {
  const socket = fakeSocket();
  gateway.handleConnection(socket, tokenRequest(code, name));
  return socket;
}

beforeEach(() => {
  eventBus = new EventBus();
  service = {
    isActive: mock(() => true),
    isRegistered: mock(() => true),
    send: mock(() => message),
    getFor: mock(() => [message]),
  };
  gateway = new MessageGateway(
    service as unknown as MessageService,
    participantAuth,
    eventBus,
  );
});

describe("connection", () => {
  test("sends the participant's history", () => {
    expect(sent(connect("Ann"))).toEqual([
      { event: "messages", data: [message] },
    ]);
    expect(service.getFor).toHaveBeenCalledWith("123456", "Ann");
  });

  test("an invalid token closes with 4401", () => {
    const socket = fakeSocket();
    gateway.handleConnection(socket, fakeRequest("token=bad"));
    expect(socket.close).toHaveBeenCalledWith(4401, "Invalid token");
  });

  test("an inactive session closes with 4404", () => {
    service.isActive.mockReturnValue(false);
    const socket = connect("Ann");
    expect(socket.close).toHaveBeenCalledWith(4404, "Session not found");
    expect(socket.send).not.toHaveBeenCalled();
  });
});

describe("sending", () => {
  test("delivers to every socket of sender and recipient in the session", () => {
    const ann = connect("Ann");
    const annTab = connect("Ann");
    const bob = connect("Bob");
    const cid = connect("Cid");
    const otherBob = connect("Bob", "654321");

    gateway.handleMessage(ann, { to: "Bob", text: "hi" });
    expect(service.send).toHaveBeenCalledWith("123456", "Ann", "Bob", "hi");
    for (const socket of [ann, annTab, bob])
      expect(sent(socket).at(-1)).toEqual({ event: "message", data: message });
    for (const socket of [cid, otherBob]) expect(sent(socket)).toHaveLength(1);
  });

  test("rejects unknown recipients", () => {
    service.isRegistered.mockReturnValue(false);
    const ann = connect("Ann");
    expect(() => gateway.handleMessage(ann, { to: "Zed", text: "hi" })).toThrow(
      new WsException("Unknown recipient"),
    );
    expect(service.send).not.toHaveBeenCalled();
  });
});

test("rejects messages past the rate limit", () => {
  const ann = connect("Ann");
  for (let i = 0; i < 20; i++)
    gateway.handleMessage(ann, { to: "Bob", text: "hi" });

  expect(() => gateway.handleMessage(ann, { to: "Bob", text: "hi" })).toThrow(
    new WsException("Too many messages, slow down"),
  );
  expect(service.send).toHaveBeenCalledTimes(20);
});

test("ending a session closes only its sockets", () => {
  const ann = connect("Ann");
  const other = connect("Bob", "654321");
  eventBus.emit("session.ended", "123456");
  expect(ann.close).toHaveBeenCalledWith(4410, "Session ended");
  expect(other.close).not.toHaveBeenCalled();
});
