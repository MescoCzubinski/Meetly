import { randomUUID } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { EventBus } from "../../common/events/event-bus";
import { UnknownRecipientException } from "../exceptions/unknown-recipient";
import {
  type Message,
  MessageRepository,
} from "../repositories/message.repository";

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    eventBus: EventBus,
  ) {
    eventBus.on("session.created", (code) =>
      messageRepository.createSession(code),
    );
    eventBus.on("session.ended", (code) =>
      messageRepository.deleteSession(code),
    );
    eventBus.on("participant.registered", (code, name) =>
      messageRepository.addParticipant(code, name),
    );
  }

  isActive(code: string): boolean {
    return this.messageRepository.hasSession(code);
  }

  send(code: string, from: string, to: string, text: string): Message {
    if (!this.messageRepository.hasParticipant(code, to))
      throw new UnknownRecipientException();
    const message = { id: randomUUID(), from, to, text, sentAt: Date.now() };
    this.messageRepository.save(code, message);
    this.logger.debug(`Session ${code}: message ${from} -> ${to}`);
    return message;
  }

  getFor(code: string, name: string): Message[] {
    return this.messageRepository.findByParticipant(code, name);
  }
}
