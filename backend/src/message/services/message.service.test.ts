import { beforeEach, expect, test } from "bun:test";
import { EventBus } from "../../common/events/event-bus";
import { UnknownRecipientException } from "../exceptions/unknown-recipient";
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
  expect(() => service.send(CODE, "Ann", "Zed", "hi")).toThrow(
    UnknownRecipientException,
  );
  expect(service.getFor(CODE, "Ann")).toEqual([]);
});

test("sent messages appear in both participants' history only", () => {
  eventBus.emit("participant.registered", CODE, "Bob");
  const message = service.send(CODE, "Ann", "Bob", "hi");
  expect(message).toEqual({
    id: expect.any(String),
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
  eventBus.emit("participant.registered", CODE, "Bob");
  service.send(CODE, "Ann", "Bob", "hi");
  eventBus.emit("session.ended", CODE);
  expect(service.isActive(CODE)).toBe(false);
  expect(service.getFor(CODE, "Ann")).toEqual([]);
});
