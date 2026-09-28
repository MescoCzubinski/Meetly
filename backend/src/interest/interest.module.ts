import { Module } from "@nestjs/common";
import { InterestGateway } from "./handlers/interest.gateway";
import { InterestRepository } from "./repositories/interest.repository";
import { EmbeddingService } from "./services/embedding.service";
import { InterestService } from "./services/interest.service";

@Module({
  providers: [
    InterestRepository,
    InterestService,
    InterestGateway,
    EmbeddingService,
  ],
})
export class InterestModule {}
