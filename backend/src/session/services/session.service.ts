import { randomInt } from "node:crypto";
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
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
  private readonly logger = new Logger(SessionService.name);
  private readonly emptyTimers = new Map<string, NodeJS.Timeout>();
  private readonly connections = new Map<string, (string | undefined)[]>();

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
    this.logger.log(`Session ${code} created`);
    this.eventBus.emit("session.created", code);
    return { code, hostToken: this.hostAuth.sign(code) };
  }

  end(code: string, hostToken: string): void {
    this.assertValidSession(code);
    if (!this.hostAuth.isHost(hostToken, code)) {
      this.logger.warn(`Session ${code}: end rejected, invalid host token`);
      throw new ForbiddenException("Only the host can end the session");
    }
    this.logger.log(`Session ${code} ended by host`);
    this.remove(code);
  }

  connect(code: string, name?: string): void {
    if (this.emptyTimers.has(code))
      this.logger.log(`Session ${code}: reconnected, empty timeout cancelled`);
    this.cancelEmptyEnd(code);
    const names = this.connections.get(code) ?? [];
    names.push(name);
    this.connections.set(code, names);
    this.logger.debug(
      `Session ${code}: ${name ?? "host"} connected (${names.length} connections)`,
    );
    if (name) this.eventBus.emit("participant.joined", code, name);
  }

  disconnect(code: string, name?: string): void {
    const names = this.connections.get(code);
    const index = names?.indexOf(name) ?? -1;
    if (!names || index === -1) return;
    names.splice(index, 1);
    this.logger.debug(
      `Session ${code}: ${name ?? "host"} disconnected (${names.length} connections)`,
    );

    if (names.length === 0) {
      this.connections.delete(code);
      this.scheduleEmptyEnd(code);
    }
    if (name && !names.includes(name))
      this.eventBus.emit("participant.left", code, name);
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
    for (let i = 2; names.has(unique); i++) {
      const suffix = ` (${i})`;
      unique = `${base.slice(0, 20 - suffix.length)}${suffix}`;
    }
    names.add(unique);
    this.logger.log(`Session ${code}: registered participant "${unique}"`);
    this.eventBus.emit("participant.registered", code, unique);
    return {
      name: unique,
      token: this.participantAuth.sign({ code, name: unique }),
    };
  }

  private scheduleEmptyEnd(code: string): void {
    if (!this.exists(code) || this.emptyTimers.has(code)) return;
    this.logger.log(
      `Session ${code} is empty, ending in ${EMPTY_TTL / 1000}s unless someone reconnects`,
    );
    this.emptyTimers.set(
      code,
      setTimeout(() => {
        this.logger.log(`Session ${code} ended, empty for too long`);
        this.remove(code);
      }, EMPTY_TTL),
    );
  }

  private cancelEmptyEnd(code: string): void {
    clearTimeout(this.emptyTimers.get(code));
    this.emptyTimers.delete(code);
  }

  private removeExpired(): void {
    for (const [code, session] of this.sessionRepository.findAll()) {
      if (session.expiresAt <= Date.now()) {
        this.logger.log(`Session ${code} expired`);
        this.remove(code);
      }
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
