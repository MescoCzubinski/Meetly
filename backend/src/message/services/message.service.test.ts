import { beforeEach, expect, test } from "bun:test";
import { EventBus } from "../../common/events/event-bus";
import { MessageRepository } from "../repositories/message.repository";
import { MessageService } from "./message.service";

const CODE = "111111";

let eventBus: EventBus;
let service: MessageService;

beforeEach(() => {
  eventBus = new EventBus();
  service = new MessageService(new MessageRepository(), eventBus);
  eventBus.emit("session.created", CODE);
});

test("only registered participants can receive messages", () => {
  eventBus.emit("participant.registered", CODE, "Bob");
  expect(service.isRegistered(CODE, "Bob")).toBe(true);
  expect(service.isRegistered(CODE, "Zed")).toBe(false);
});

test("sent messages appear in both participants' history only", () => {
  const message = service.send(CODE, "Ann", "Bob", "hi");
  expect(message).toEqual({
    from: "Ann",
    to: "Bob",
    text: "hi",
    sentAt: expect.any(Number),
  });
  expect(service.getFor(CODE, "Ann")).toEqual([message]);
  expect(service.getFor(CODE, "Bob")).toEqual([message]);
  expect(service.getFor(CODE, "Cid")).toEqual([]);
});

test("ending the session drops its messages", () => {
  service.send(CODE, "Ann", "Bob", "hi");
  eventBus.emit("session.ended", CODE);
  expect(service.isActive(CODE)).toBe(false);
  expect(service.getFor(CODE, "Ann")).toEqual([]);
});
