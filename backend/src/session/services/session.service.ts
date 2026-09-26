import { randomInt } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { AnswerDto } from "../handlers/answer.dto";
import { EmbeddingService } from "./embedding.service";
import { SessionNotFoundException } from "../exceptions/not-found";

interface Session {
  answers: AnswerDto[];
  expiresAt: number;
}

const SESSION_TTL = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const SIMILARITY_THRESHOLD = 0.6;

@Injectable()
export class SessionService {
  private readonly sessions = new Map<string, Session>();
  private readonly expiredListeners: ((code: string) => void)[] = [];

  constructor(private readonly embeddingService: EmbeddingService) {
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

  assertExists(code: string): void {
    if (!this.exists(code)) throw new SessionNotFoundException(code);
  }

  getAnswers(code: string): AnswerDto[] {
    return this.get(code)?.answers ?? [];
  }

  getLinks(code: string): [string, string, number][] {
    const answers = this.getAnswers(code);
    const links: [string, string, number][] = [];
    answers.forEach((a, i) =>
      answers.slice(i + 1).forEach((b) => {
        const strength =
          (this.match(a.interests, b.interests) +
            this.match(b.interests, a.interests)) /
          2;
        if (strength > 0) links.push([a.name, b.name, strength]);
      }),
    );
    return links;
  }

  async addAnswer(code: string, answer: AnswerDto): Promise<void> {
    const answers = this.get(code)?.answers;
    if (!answers) return;

    const index = answers.findIndex((a) => a.name === answer.name);
    if (index === -1) answers.push(answer);
    else answers[index] = answer;

    await this.embeddingService.embed(answer.interests);
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

  private match(from: string[], to: string[]): number {
    return from.reduce((sum, x) => {
      const best = Math.max(
        0,
        ...to.map((y) => this.embeddingService.similarity(x, y)),
      );
      return (
        sum +
        Math.max(0, (best - SIMILARITY_THRESHOLD) / (1 - SIMILARITY_THRESHOLD))
      );
    }, 0);
  }

  private get(code: string): Session | undefined {
    const session = this.sessions.get(code);
    return session && session.expiresAt > Date.now() ? session : undefined;
  }
}
