export const config = {
  port: process.env.PORT,
  corsOrigin: process.env.CORS_ORIGIN,
  jwtSecret: process.env.JWT_SECRET,
};

const REQUIRED_VARS = ["PORT", "CORS_ORIGIN", "JWT_SECRET"] as const;

export function validateConfig(): {
  port: number;
  corsOrigin: string;
  jwtSecret: string;
} {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0)
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );

  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error(
      `PORT must be a number between 1 and 65535, got "${process.env.PORT}"`,
    );

  return {
    port,
    corsOrigin: process.env.CORS_ORIGIN!,
    jwtSecret: process.env.JWT_SECRET!,
  };
}
