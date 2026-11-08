import { registerAs } from "@nestjs/config";
import { plainToInstance } from "class-transformer";
import {
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from "class-validator";

class Environment {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @Matches(/\S/, { message: "CORS_ORIGIN must not be blank" })
  CORS_ORIGIN!: string;

  @IsString()
  @Matches(/\S/, { message: "JWT_SECRET must not be blank" })
  JWT_SECRET!: string;
}

export const validateEnvironment = (
  env: Record<string, unknown>,
): Environment => {
  const environment = plainToInstance(Environment, env, {
    enableImplicitConversion: true,
  });
  const problems = validateSync(environment).flatMap((error) =>
    Object.values(error.constraints ?? {}),
  );
  if (problems.length > 0)
    throw new Error(`Invalid environment: ${problems.join("; ")}`);
  return environment;
};

export const serverConfig = registerAs("server", () => ({
  port: Number(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN!,
}));

export const authConfig = registerAs("auth", () => ({
  jwtSecret: process.env.JWT_SECRET!,
}));
