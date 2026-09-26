import { Module } from "@nestjs/common";
import { EmbeddingService } from "./services/embedding.service";
import { SessionController } from "./handlers/session.controller";
import { SessionGateway } from "./handlers/session.gateway";
import { SessionService } from "./services/session.service";

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionGateway, EmbeddingService],
})
export class SessionModule {}
