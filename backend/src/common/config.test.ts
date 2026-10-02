import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { validateConfig } from "./config";

const ENV_VARS = ["PORT", "CORS_ORIGIN", "JWT_SECRET"] as const;
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(ENV_VARS.map((v) => [v, process.env[v]]));
  process.env.PORT = "8080";
  process.env.CORS_ORIGIN = "http://localhost:5173";
  process.env.JWT_SECRET = "secret";
});

afterEach(() => {
  for (const v of ENV_VARS) {
    if (saved[v] === undefined) delete process.env[v];
    else process.env[v] = saved[v];
  }
});

describe("validateConfig", () => {
  test("returns the parsed config when every variable is set", () => {
    expect(validateConfig()).toEqual({
      port: 8080,
      corsOrigin: "http://localhost:5173",
      jwtSecret: "secret",
    });
  });

  test("throws when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET;
    expect(() => validateConfig()).toThrow(/JWT_SECRET/);
  });

  test("throws when CORS_ORIGIN is missing", () => {
    delete process.env.CORS_ORIGIN;
    expect(() => validateConfig()).toThrow(/CORS_ORIGIN/);
  });

  test("lists every missing variable at once", () => {
    delete process.env.CORS_ORIGIN;
    delete process.env.JWT_SECRET;
    expect(() => validateConfig()).toThrow(/CORS_ORIGIN.*JWT_SECRET/);
  });

  test("throws when PORT is not a number", () => {
    process.env.PORT = "not-a-number";
    expect(() => validateConfig()).toThrow(/PORT/);
  });

  test("throws when PORT is out of range", () => {
    process.env.PORT = "99999";
    expect(() => validateConfig()).toThrow(/PORT/);
  });
});
