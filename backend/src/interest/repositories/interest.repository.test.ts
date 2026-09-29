import { beforeEach, expect, test } from "bun:test";
import { InterestRepository } from "./interest.repository";

let repository: InterestRepository;

beforeEach(() => {
  repository = new InterestRepository();
  repository.createSession("111111");
});

test("save replaces an answer by name", () => {
  repository.save("111111", { name: "Ann", interests: ["chess"] });
  repository.save("111111", { name: "Bob", interests: ["go"] });
  repository.save("111111", { name: "Ann", interests: ["poker"] });
  expect(repository.findAll("111111")).toEqual([
    { name: "Ann", interests: ["poker"] },
    { name: "Bob", interests: ["go"] },
  ]);
});

test("delete removes an answer by name", () => {
  repository.save("111111", { name: "Ann", interests: ["chess"] });
  repository.save("111111", { name: "Bob", interests: ["go"] });
  repository.delete("111111", "Ann");
  expect(repository.findAll("111111")).toEqual([
    { name: "Bob", interests: ["go"] },
  ]);
});
