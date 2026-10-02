import { describe, expect, jest, test } from "bun:test";
import { RateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  test("allows up to the limit within the window, then blocks", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(false);
  });

  test("allows more hits once the window has passed", () => {
    jest.useFakeTimers();
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(false);

    jest.advanceTimersByTime(1000);
    expect(limiter.consume("a")).toBe(true);
    jest.useRealTimers();
  });
});
