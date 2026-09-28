import { Module } from "@nestjs/common";
import { AuthModule } from "./common/auth/auth.module";
import { EventsModule } from "./common/events/events.module";
import { HealthModule } from "./health/health.module";
import { InterestModule } from "./interest/interest.module";
import { MessageModule } from "./message/message.module";
import { SessionModule } from "./session/session.module";

@Module({
  imports: [
    AuthModule,
    EventsModule,
    HealthModule,
    SessionModule,
    InterestModule,
    MessageModule,
  ],
})
export class AppModule {}
