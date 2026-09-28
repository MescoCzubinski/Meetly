import { Injectable } from "@nestjs/common";
import { EventBus } from "../../common/events/event-bus";
import {
  type Message,
  MessageRepository,
} from "../repositories/message.repository";

@Injectable()
export class MessageService {
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

  isRegistered(code: string, name: string): boolean {
    return this.messageRepository.hasParticipant(code, name);
  }

  send(code: string, from: string, to: string, text: string): Message {
    const message = { from, to, text, sentAt: Date.now() };
    this.messageRepository.save(code, message);
    return message;
  }

  getFor(code: string, name: string): Message[] {
    return this.messageRepository.findByParticipant(code, name);
  }
}
