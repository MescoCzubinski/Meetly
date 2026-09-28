import { Injectable } from "@nestjs/common";

export interface Session {
  hostToken: string;
  expiresAt: number;
}

@Injectable()
export class SessionRepository {
  private readonly sessions = new Map<string, Session>();

  find(code: string): Session | undefined {
    return this.sessions.get(code);
  }

  findAll(): [string, Session][] {
    return [...this.sessions];
  }

  has(code: string): boolean {
    return this.sessions.has(code);
  }

  save(code: string, session: Session): void {
    this.sessions.set(code, session);
  }

  delete(code: string): void {
    this.sessions.delete(code);
  }
}
