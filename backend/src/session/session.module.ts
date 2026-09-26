import { Module } from "@nestjs/common";
import { EmbeddingService } from "./embedding.service";
import { SessionController } from "./session.controller";
import { SessionGateway } from "./session.gateway";
import { SessionService } from "./session.service";

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionGateway, EmbeddingService],
})
export class SessionModule {}
