import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  mock,
  test,
} from "bun:test";
import { ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { HostAuth } from "../../common/auth/host-auth";
import { ParticipantAuth } from "../../common/auth/participant-auth";
import { EventBus } from "../../common/events/event-bus";
import { InvalidSessionCodeException } from "../exceptions/invalid-code";
import { SessionRepository } from "../repositories/session.repository";
import { SessionService } from "./session.service";

const MINUTE = 60 * 1000;

const jwtService = new JwtService({ secret: "secret" });
const participantAuth = new ParticipantAuth(jwtService);

let service: SessionService;
let ended: ReturnType<typeof mock>;
let presence: ReturnType<typeof mock>;

beforeEach(() => {
  jest.useFakeTimers();
  const eventBus = new EventBus();
  ended = mock();
  eventBus.on("session.ended", ended);
  presence = mock();
  eventBus.on("participant.joined", (...args) =>
    presence("participant.joined", ...args),
  );
  eventBus.on("participant.left", (...args) =>
    presence("participant.left", ...args),
  );
  service = new SessionService(
    new SessionRepository(),
    eventBus,
    new HostAuth(jwtService),
    participantAuth,
  );
});

afterEach(() => {
  jest.useRealTimers();
});

test("rejects malformed codes", () => {
  for (const code of ["", "12345", "1234567", "abcdef", " 12345"])
    expect(() => service.assertValidSession(code)).toThrow(
      InvalidSessionCodeException,
    );
});

test("sessions expire after an hour", () => {
  const { code } = service.create();
  jest.advanceTimersByTime(59 * MINUTE);
  expect(service.exists(code)).toBe(true);

  jest.advanceTimersByTime(MINUTE);
  expect(service.exists(code)).toBe(false);
  expect(ended).toHaveBeenCalledWith(code);
});

describe("register", () => {
  test("trims the name and signs a participant token", () => {
    const { code } = service.create();
    const { name, token } = service.register(code, "  Ann ");
    expect(name).toBe("Ann");
    expect(participantAuth.verifyToken(token)).toEqual({ code, name: "Ann" });
  });

  test("deduplicates names with a numeric suffix", () => {
    const { code } = service.create();
    expect(service.register(code, "Ann").name).toBe("Ann");
    expect(service.register(code, "Ann").name).toBe("Ann (2)");
    expect(service.register(code, "Ann").name).toBe("Ann (3)");
  });

  test("keeps deduplicated names within 20 characters", () => {
    const { code } = service.create();
    const long = "A".repeat(20);
    service.register(code, long);
    expect(service.register(code, long).name).toBe(`${"A".repeat(16)} (2)`);
  });

  test("names are unique per session", () => {
    const a = service.create().code;
    const b = service.create().code;
    service.register(a, "Ann");
    expect(service.register(b, "Ann").name).toBe("Ann");
  });
});

test("only the session's host can end it", () => {
  const { code, hostToken } = service.create();
  const other = service.create();
  const { token } = service.register(code, "Ann");
  for (const bad of ["", token, other.hostToken])
    expect(() => service.end(code, bad)).toThrow(ForbiddenException);

  service.end(code, hostToken);
  expect(service.exists(code)).toBe(false);
});

describe("presence", () => {
  let code: string;
  let hostToken: string;

  beforeEach(() => {
    ({ code, hostToken } = service.create());
  });

  test("participants join on connect", () => {
    service.connect(code, "Ann");
    expect(presence).toHaveBeenCalledWith("participant.joined", code, "Ann");
  });

  test("the host connects without joining", () => {
    service.connect(code);
    expect(presence).not.toHaveBeenCalled();
  });

  test("participants leave when their last connection closes", () => {
    service.connect(code, "Ann");
    service.connect(code, "Ann");

    service.disconnect(code, "Ann");
    expect(presence).not.toHaveBeenCalledWith("participant.left", code, "Ann");

    service.disconnect(code, "Ann");
    expect(presence).toHaveBeenCalledWith("participant.left", code, "Ann");
  });

  test("the session ends 5 minutes after its last connection closes", () => {
    service.connect(code);
    service.connect(code, "Ann");
    service.disconnect(code, "Ann");
    jest.advanceTimersByTime(5 * MINUTE);
    expect(service.exists(code)).toBe(true);

    service.disconnect(code);
    jest.advanceTimersByTime(5 * MINUTE - 1);
    expect(service.exists(code)).toBe(true);
    jest.advanceTimersByTime(1);
    expect(service.exists(code)).toBe(false);
  });

  test("reconnecting cancels the empty end", () => {
    service.connect(code);
    service.disconnect(code);
    jest.advanceTimersByTime(5 * MINUTE - 1);
    service.connect(code);
    jest.advanceTimersByTime(5 * MINUTE);
    expect(service.exists(code)).toBe(true);
  });

  test("a manual end emits session.ended only once", () => {
    service.connect(code);
    service.disconnect(code);
    service.end(code, hostToken);
    jest.advanceTimersByTime(60 * MINUTE);
    expect(ended).toHaveBeenCalledTimes(1);
  });
});
