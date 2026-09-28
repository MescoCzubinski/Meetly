import { Module } from "@nestjs/common";
import { SessionController } from "./handlers/session.controller";
import { SessionGateway } from "./handlers/session.gateway";
import { SessionRepository } from "./repositories/session.repository";
import { SessionService } from "./services/session.service";

@Module({
  controllers: [SessionController],
  providers: [SessionRepository, SessionService, SessionGateway],
})
export class SessionModule {}
