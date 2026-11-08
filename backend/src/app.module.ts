import { Module, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { AuthModule } from "./common/auth/auth.module";
import { EventsModule } from "./common/events/events.module";
import { HttpExceptionFilter } from "./common/exceptions/http-exception.filter";
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
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
