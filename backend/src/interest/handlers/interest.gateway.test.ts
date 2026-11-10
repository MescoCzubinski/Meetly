import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  setSystemTime,
  test,
} from "bun:test";
import { Reflector } from "@nestjs/core";
import {
  fakeRequest,
  fakeSocket,
  participantAuth,
  sent,
  tokenRequest,
  wsContext,
} from "../../../test/fakes";
import { EventBus } from "../../common/events/event-bus";
import { WsRateLimitGuard } from "../../common/rate-limit.guard";
import type { InterestService } from "../services/interest.service";
import { InterestGateway } from "./interest.gateway";

const answers = [{ name: "Ann", interests: ["chess"], active: true }];
const links = [["Ann", "Bob", 1]];
const interests = { event: "interests", data: { answers, links } };

let eventBus: EventBus;
let service: Record<
  "isActive" | "getAnswers" | "getLinks" | "addAnswer" | "join" | "leave",
  ReturnType<typeof mock>
>;
let gateway: InterestGateway;

const connect = (name: string, code = "123456") => {
  const socket = fakeSocket();
  gateway.handleConnection(socket, tokenRequest(code, name));
  return socket;
};

beforeEach(() => {
  eventBus = new EventBus();
  service = {
    isActive: mock(() => true),
    getAnswers: mock(() => answers),
    getLinks: mock(() => links),
    addAnswer: mock(async () => {}),
    join: mock(() => true),
    leave: mock(() => true),
  };
  gateway = new InterestGateway(
    service as unknown as InterestService,
    participantAuth,
    eventBus,
  );
});

describe("connection", () => {
  test("sends the current interests", () => {
    expect(sent(connect("Ann"))).toEqual([interests]);
    expect(service.getAnswers).toHaveBeenCalledWith("123456");
  });

  test("an invalid token closes with 4401", () => {
    const socket = fakeSocket();
    gateway.handleConnection(socket, fakeRequest("token=bad"));
    expect(socket.close).toHaveBeenCalledWith(4401, "Invalid token");
  });

  test("an inactive session closes with 4404", () => {
    service.isActive.mockReturnValue(false);
    const socket = connect("Ann");
    expect(socket.close).toHaveBeenCalledWith(4404, "Session not found");
    expect(socket.send).not.toHaveBeenCalled();
  });
});

test("an answer is saved and broadcast to the session", async () => {
  const ann = connect("Ann");
  const bob = connect("Bob");
  const other = connect("Cid", "654321");

  await gateway.handleAnswer(ann, { interests: ["chess"] });
  expect(service.addAnswer).toHaveBeenCalledWith("123456", {
    name: "Ann",
    interests: ["chess"],
  });
  expect(sent(ann)).toEqual([interests, interests]);
  expect(sent(bob)).toEqual([interests, interests]);
  expect(sent(other)).toEqual([interests]);
});

describe("presence", () => {
  test("broadcasts when a participant rejoins", () => {
    const ann = connect("Ann");
    eventBus.emit("participant.joined", "123456", "Ann");
    expect(service.join).toHaveBeenCalledWith("123456", "Ann");
    expect(sent(ann)).toHaveLength(2);
  });

  test("stays quiet when a join changes nothing", () => {
    service.join.mockReturnValue(false);
    const ann = connect("Ann");
    eventBus.emit("participant.joined", "123456", "Ann");
    expect(sent(ann)).toHaveLength(1);
  });

  test("broadcasts when a participant leaves and when they are removed", () => {
    const bob = connect("Bob");
    eventBus.emit("participant.left", "123456", "Ann");
    expect(sent(bob)).toHaveLength(2);

    const [, , onRemoved] = service.leave.mock.calls[0];
    onRemoved();
    expect(sent(bob)).toHaveLength(3);
  });
});

test("ending a session closes only its sockets", () => {
  const ann = connect("Ann");
  const other = connect("Cid", "654321");
  eventBus.emit("session.ended", "123456");
  expect(ann.close).toHaveBeenCalledWith(4410, "Session ended");
  expect(other.close).not.toHaveBeenCalled();
});

describe("rate limit", () => {
  afterEach(() => setSystemTime());

  test("allows 10 updates per client every 10 seconds", () => {
    const guard = new WsRateLimitGuard(new Reflector());
    const context = wsContext(
      InterestGateway.prototype.handleAnswer,
      fakeSocket(),
    );
    const start = Date.now();
    setSystemTime(start);

    for (let i = 0; i < 10; i++) expect(guard.canActivate(context)).toBe(true);
    expect(() => guard.canActivate(context)).toThrow(
      "Too many updates, slow down",
    );

    setSystemTime(start + 9999);
    expect(() => guard.canActivate(context)).toThrow(
      "Too many updates, slow down",
    );

    setSystemTime(start + 10_000);
    expect(guard.canActivate(context)).toBe(true);
  });
});
