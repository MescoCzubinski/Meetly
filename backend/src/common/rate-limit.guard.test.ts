import { expect, test } from "bun:test";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WsException } from "@nestjs/websockets";
import { RateLimit, WsRateLimitGuard } from "./rate-limit.guard";

class Gateway {
  @RateLimit({ limit: 2, windowMs: 1000, message: "Slow down" })
  handle() {}
}

const contextFor = (client: object) =>
  ({
    getHandler: () => Gateway.prototype.handle,
    switchToWs: () => ({ getClient: () => client }),
  }) as unknown as ExecutionContext;

test("allows each client up to the limit, then rejects", () => {
  const guard = new WsRateLimitGuard(new Reflector());
  const ann = contextFor({});
  const bob = contextFor({});

  expect(guard.canActivate(ann)).toBe(true);
  expect(guard.canActivate(ann)).toBe(true);
  expect(() => guard.canActivate(ann)).toThrow(new WsException("Slow down"));
  expect(guard.canActivate(bob)).toBe(true);
});
