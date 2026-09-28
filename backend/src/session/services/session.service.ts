import { randomInt } from "node:crypto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { HostAuth } from "../../common/auth/host-auth";
import { ParticipantAuth } from "../../common/auth/participant-auth";
import { EventBus } from "../../common/events/event-bus";
import { SessionNotFoundException } from "../exceptions/not-found";
import { InvalidSessionCodeException } from "../exceptions/invalid-code";
import {
  type Session,
  SessionRepository,
} from "../repositories/session.repository";

const SESSION_TTL = 60 * 60 * 1000; // 1 hour
const EMPTY_TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

const CODE_PATTERN = /^\d{6}$/;

@Injectable()
export class SessionService {
  private readonly emptyTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly eventBus: EventBus,
    private readonly hostAuth: HostAuth,
    private readonly participantAuth: ParticipantAuth,
  ) {
    setInterval(() => this.removeExpired(), CLEANUP_INTERVAL);
  }

  create(): { code: string; hostToken: string } {
    let code: string;
    do {
      code = randomInt(100000, 1000000).toString();
    } while (this.sessionRepository.has(code));

    this.sessionRepository.save(code, {
      expiresAt: Date.now() + SESSION_TTL,
      names: new Set(),
    });
    this.eventBus.emit("session.created", code);
    return { code, hostToken: this.hostAuth.sign(code) };
  }

  end(code: string, hostToken: string): void {
    this.assertValidSession(code);
    if (!this.hostAuth.isHost(hostToken, code))
      throw new ForbiddenException("Only the host can end the session");
    this.remove(code);
  }

  scheduleEmptyEnd(code: string): void {
    if (!this.exists(code) || this.emptyTimers.has(code)) return;
    this.emptyTimers.set(
      code,
      setTimeout(() => this.remove(code), EMPTY_TTL),
    );
  }

  cancelEmptyEnd(code: string): void {
    clearTimeout(this.emptyTimers.get(code));
    this.emptyTimers.delete(code);
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

  register(code: string, name: string): { name: string; token: string } {
    this.assertValidSession(code);
    const { names } = this.get(code)!;
    const base = name.trim();
    let unique = base;
    for (let i = 2; names.has(unique); i++) unique = `${base} (${i})`;
    names.add(unique);
    return {
      name: unique,
      token: this.participantAuth.sign({ code, name: unique }),
    };
  }

  join(code: string, name: string): void {
    this.eventBus.emit("participant.joined", code, name);
  }

  leave(code: string, name: string): void {
    this.eventBus.emit("participant.left", code, name);
  }

  private removeExpired(): void {
    for (const [code, session] of this.sessionRepository.findAll()) {
      if (session.expiresAt <= Date.now()) this.remove(code);
    }
  }

  private remove(code: string): void {
    if (!this.sessionRepository.has(code)) return;
    this.cancelEmptyEnd(code);
    this.sessionRepository.delete(code);
    this.eventBus.emit("session.ended", code);
  }

  private get(code: string): Session | undefined {
    const session = this.sessionRepository.find(code);
    return session && session.expiresAt > Date.now() ? session : undefined;
  }
}
