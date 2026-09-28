import { Module } from "@nestjs/common";
import { MessageGateway } from "./handlers/message.gateway";
import { MessageRepository } from "./repositories/message.repository";
import { MessageService } from "./services/message.service";

@Module({
  providers: [MessageRepository, MessageService, MessageGateway],
})
export class MessageModule {}
