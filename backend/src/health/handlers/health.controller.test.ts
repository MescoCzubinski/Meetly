import { expect, test } from "bun:test";
import { HealthController } from "./health.controller";

test("reports ok", () => {
  expect(new HealthController().check()).toEqual({ status: "ok" });
});
