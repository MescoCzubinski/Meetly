import { describe, expect, jest, test } from "bun:test";
import { RateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  test("allows up to the limit within the window", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("a")).toBe(false);
  });

  test("tracks each key independently", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.consume("a")).toBe(true);
    expect(limiter.consume("b")).toBe(true);
    expect(limiter.consume("a")).toBe(false);
    expect(limiter.consume("b")).toBe(false);
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

  test("delete forgets a key's history", () => {
    const limiter = new RateLimiter(1, 1000);
    limiter.consume("a");
    limiter.delete("a");
    expect(limiter.consume("a")).toBe(true);
  });
});
