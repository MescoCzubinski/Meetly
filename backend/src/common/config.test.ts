import { expect, test } from "bun:test";
import { validateEnvironment } from "./config";

const valid = {
  PORT: "8080",
  CORS_ORIGIN: "http://localhost:5173",
  JWT_SECRET: "secret",
};

test("accepts a complete environment and converts the port", () => {
  expect(validateEnvironment(valid)).toMatchObject({ ...valid, PORT: 8080 });
});

test("rejects missing variables", () => {
  for (const name of Object.keys(valid))
    expect(() => validateEnvironment({ ...valid, [name]: undefined })).toThrow(
      name,
    );
});

test("rejects a blank JWT secret", () => {
  expect(() => validateEnvironment({ ...valid, JWT_SECRET: "  " })).toThrow(
    "JWT_SECRET must not be blank",
  );
});

test("rejects ports outside 1-65535", () => {
  for (const PORT of ["0", "65536", "abc"])
    expect(() => validateEnvironment({ ...valid, PORT })).toThrow("PORT");
});
