import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { SessionModule } from "./session/session.module";

@Module({
  imports: [HealthModule, SessionModule],
})
export class AppModule {}
