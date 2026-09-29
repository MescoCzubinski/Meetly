import { expect, test } from "bun:test";
import { SessionRepository } from "./session.repository";

test("saves, finds and deletes sessions", () => {
  const repository = new SessionRepository();
  const session = { expiresAt: 1, names: new Set<string>() };

  repository.save("111111", session);
  expect(repository.find("111111")).toBe(session);
  expect(repository.findAll()).toEqual([["111111", session]]);

  repository.delete("111111");
  expect(repository.has("111111")).toBe(false);
});
