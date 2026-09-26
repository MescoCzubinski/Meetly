import { randomInt } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { AnswerDto } from "./answer.dto";

interface Session {
  answers: AnswerDto[];
  expiresAt: number;
}

const SESSION_TTL = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

@Injectable()
export class SessionService {
  private readonly sessions = new Map<string, Session>();
  private readonly expiredListeners: ((code: string) => void)[] = [];

  constructor() {
    setInterval(() => this.removeExpired(), CLEANUP_INTERVAL);
  }

  create(): string {
    let code: string;
    do {
      code = randomInt(100000, 1000000).toString();
    } while (this.sessions.has(code));

    this.sessions.set(code, {
      answers: [],
      expiresAt: Date.now() + SESSION_TTL,
    });
    return code;
  }

  exists(code: string): boolean {
    return this.get(code) !== undefined;
  }

  getAnswers(code: string): AnswerDto[] {
    return this.get(code)?.answers ?? [];
  }

  getLinks(code: string): [string, string, number][] {
    const answers = this.getAnswers(code);
    const links: [string, string, number][] = [];
    answers.forEach((a, i) =>
      answers.slice(i + 1).forEach((b) => {
        const strength = a.interests.flatMap((x) =>
          b.interests.filter((y) => x === y),
        ).length;
        if (strength > 0) links.push([a.name, b.name, strength]);
      }),
    );
    return links;
  }

  addAnswer(code: string, answer: AnswerDto): void {
    const answers = this.get(code)?.answers;
    if (!answers) return;

    const index = answers.findIndex((a) => a.name === answer.name);
    if (index === -1) answers.push(answer);
    else answers[index] = answer;
  }

  onExpired(listener: (code: string) => void): void {
    this.expiredListeners.push(listener);
  }

  private removeExpired(): void {
    for (const [code, session] of this.sessions) {
      if (session.expiresAt <= Date.now()) {
        this.sessions.delete(code);
        this.expiredListeners.forEach((listener) => listener(code));
      }
    }
  }

  private get(code: string): Session | undefined {
    const session = this.sessions.get(code);
    return session && session.expiresAt > Date.now() ? session : undefined;
  }
}
