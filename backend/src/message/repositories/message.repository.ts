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
  private readonly participants = new Map<string, Set<string>>();

  createSession(code: string): void {
    this.messages.set(code, []);
    this.participants.set(code, new Set());
  }

  hasSession(code: string): boolean {
    return this.messages.has(code);
  }

  addParticipant(code: string, name: string): void {
    this.participants.get(code)?.add(name);
  }

  hasParticipant(code: string, name: string): boolean {
    return this.participants.get(code)?.has(name) ?? false;
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
    this.participants.delete(code);
  }
}
