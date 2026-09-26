import { Module } from "@nestjs/common";
import { HealthController } from "./handlers/health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
