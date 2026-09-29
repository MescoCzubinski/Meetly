import { beforeEach, expect, mock, test } from "bun:test";
import type { SessionService } from "../services/session.service";
import { SessionController } from "./session.controller";

const service = {
  create: mock(() => ({ code: "123456", hostToken: "host" })),
  assertValidSession: mock(),
  register: mock(() => ({ name: "Ann", token: "token" })),
  end: mock(),
};
const controller = new SessionController(service as unknown as SessionService);

beforeEach(() => {
  for (const fn of Object.values(service)) fn.mockClear();
});

test("POST /sessions returns the created session", () => {
  expect(controller.create()).toEqual({ code: "123456", hostToken: "host" });
});

test("GET /sessions/:code validates the session and echoes its code", () => {
  expect(controller.get("123456")).toEqual({ code: "123456" });
  expect(service.assertValidSession).toHaveBeenCalledWith("123456");
});

test("POST /sessions/:code/participants registers the name", () => {
  expect(controller.register("123456", { name: "Ann" })).toEqual({
    name: "Ann",
    token: "token",
  });
  expect(service.register).toHaveBeenCalledWith("123456", "Ann");
});

test("DELETE /sessions/:code passes the host token", () => {
  controller.end("123456", "host");
  expect(service.end).toHaveBeenCalledWith("123456", "host");
});
