import { beforeEach, expect, test } from "bun:test";
import { MessageRepository } from "./message.repository";

let repository: MessageRepository;

beforeEach(() => {
  repository = new MessageRepository();
  repository.createSession("111111");
  repository.createSession("222222");
});

const message = (from: string, to: string) => ({
  from,
  to,
  text: "",
  sentAt: 0,
});

test("participants are tracked per session", () => {
  repository.addParticipant("111111", "Ann");
  expect(repository.hasParticipant("111111", "Ann")).toBe(true);
  expect(repository.hasParticipant("222222", "Ann")).toBe(false);
});

test("findByParticipant returns messages sent or received", () => {
  repository.save("111111", message("Ann", "Bob"));
  repository.save("111111", message("Bob", "Cid"));
  repository.save("111111", message("Cid", "Ann"));
  expect(repository.findByParticipant("111111", "Ann")).toEqual([
    message("Ann", "Bob"),
    message("Cid", "Ann"),
  ]);
});
