import { randomInt, randomUUID } from "node:crypto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import type { AnswerDto } from "../handlers/answer.dto";
import { EmbeddingService } from "./embedding.service";
import { SessionNotFoundException } from "../exceptions/not-found";
import { InvalidSessionCodeException } from "../exceptions/invalid-code";
import {
  type Session,
  SessionRepository,
} from "../repositories/session.repository";

const SESSION_TTL = 60 * 60 * 1000; // 1 hour
const INACTIVE_TTL = 5 * 60 * 1000; // 5 minutes
const EMPTY_TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const SIMILARITY_THRESHOLD = 0.6;

const CODE_PATTERN = /^\d{6}$/;

@Injectable()
export class SessionService {
  private readonly endedListeners: ((code: string) => void)[] = [];

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly embeddingService: EmbeddingService,
  ) {
    setInterval(() => this.removeExpired(), CLEANUP_INTERVAL);
  }

  create(): { code: string; hostToken: string } {
    let code: string;
    do {
      code = randomInt(100000, 1000000).toString();
    } while (this.sessionRepository.has(code));

    const hostToken = randomUUID();
    this.sessionRepository.save(code, {
      answers: [],
      removals: new Map(),
      hostToken,
      expiresAt: Date.now() + SESSION_TTL,
    });
    return { code, hostToken };
  }

  end(code: string, hostToken: string): void {
    this.assertValidSession(code);
    if (this.sessionRepository.find(code)?.hostToken !== hostToken)
      throw new ForbiddenException("Only the host can end the session");
    this.remove(code);
  }

  scheduleEmptyEnd(code: string): void {
    const session = this.get(code);
    if (!session || session.emptyTimer) return;
    session.emptyTimer = setTimeout(() => this.remove(code), EMPTY_TTL);
  }

  cancelEmptyEnd(code: string): void {
    const session = this.get(code);
    if (!session) return;
    clearTimeout(session.emptyTimer);
    session.emptyTimer = undefined;
  }

  isValidCode(code: string): boolean {
    return CODE_PATTERN.test(code);
  }

  exists(code: string): boolean {
    return this.get(code) !== undefined;
  }

  assertValidSession(code: string): void {
    if (!this.isValidCode(code)) throw new InvalidSessionCodeException();
    if (!this.exists(code)) throw new SessionNotFoundException(code);
  }

  getAnswers(code: string): (AnswerDto & { active: boolean })[] {
    const session = this.get(code);
    if (!session) return [];
    return session.answers.map((a) => ({
      ...a,
      active: !session.removals.has(a.name),
    }));
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

  join(code: string, name: string): boolean {
    const removals = this.get(code)?.removals;
    const timer = removals?.get(name);
    if (!removals || !timer) return false;
    clearTimeout(timer);
    removals.delete(name);
    return true;
  }

  leave(code: string, name: string, onRemoved: () => void): boolean {
    const session = this.get(code);
    if (!session || session.removals.has(name)) return false;
    if (!session.answers.some((a) => a.name === name)) return false;

    const timer = setTimeout(() => {
      session.removals.delete(name);
      const index = session.answers.findIndex((a) => a.name === name);
      if (index !== -1) session.answers.splice(index, 1);
      onRemoved();
    }, INACTIVE_TTL);
    session.removals.set(name, timer);
    return true;
  }

  onEnded(listener: (code: string) => void): void {
    this.endedListeners.push(listener);
  }

  private removeExpired(): void {
    for (const [code, session] of this.sessionRepository.findAll()) {
      if (session.expiresAt <= Date.now()) this.remove(code);
    }
  }

  private remove(code: string): void {
    const session = this.sessionRepository.find(code);
    if (!session) return;
    session.removals.forEach(clearTimeout);
    clearTimeout(session.emptyTimer);
    this.sessionRepository.delete(code);
    this.endedListeners.forEach((listener) => listener(code));
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
    const session = this.sessionRepository.find(code);
    return session && session.expiresAt > Date.now() ? session : undefined;
  }
}
