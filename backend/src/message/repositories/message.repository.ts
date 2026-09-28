import { Injectable } from "@nestjs/common";

export interface Message {
  from: string;
  to: string;
  text: string;
  sentAt: number;
}

@Injectable()
export class MessageRepository {
  private readonly messages = new Map<string, Message[]>();

  createSession(code: string): void {
    this.messages.set(code, []);
  }

  hasSession(code: string): boolean {
    return this.messages.has(code);
  }

  findByParticipant(code: string, name: string): Message[] {
    return (this.messages.get(code) ?? []).filter(
      (m) => m.from === name || m.to === name,
    );
  }

  save(code: string, message: Message): void {
    this.messages.get(code)?.push(message);
  }

  deleteSession(code: string): void {
    this.messages.delete(code);
  }
}
