import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  mock,
  test,
} from "bun:test";
import { FakeEmbeddingService } from "../../../test/fake-embedding";
import { EventBus } from "../../common/events/event-bus";
import { InterestRepository } from "../repositories/interest.repository";
import type { EmbeddingService } from "./embedding.service";
import { InterestService } from "./interest.service";

const CODE = "111111";
const INACTIVE_TTL = 5 * 60 * 1000;

let eventBus: EventBus;
let embedding: FakeEmbeddingService;
let service: InterestService;

beforeEach(() => {
  jest.useFakeTimers();
  eventBus = new EventBus();
  embedding = new FakeEmbeddingService();
  service = new InterestService(
    new InterestRepository(),
    embedding as unknown as EmbeddingService,
    eventBus,
  );
  eventBus.emit("session.created", CODE);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("InterestService", () => {
  test("addAnswer stores the answer and embeds its interests", async () => {
    await service.addAnswer(CODE, { name: "Ann", interests: ["chess", "go"] });
    expect(service.getAnswers(CODE)).toEqual([
      { name: "Ann", interests: ["chess", "go"], active: true },
    ]);
    expect(embedding.embedded).toEqual([["chess", "go"]]);
  });

  describe("getLinks", () => {
    test("links participants with similar interests", async () => {
      await service.addAnswer(CODE, {
        name: "Ann",
        interests: ["chess", "go"],
      });
      await service.addAnswer(CODE, { name: "Bob", interests: ["Chess"] });
      await service.addAnswer(CODE, { name: "Cid", interests: ["surfing"] });
      expect(service.getLinks(CODE)).toEqual([["Ann", "Bob", 1]]);
    });

    test("scales similarity above the threshold", async () => {
      embedding.similarity = (a, b) => (a === b ? 1 : 0.8);
      await service.addAnswer(CODE, { name: "Ann", interests: ["chess"] });
      await service.addAnswer(CODE, { name: "Bob", interests: ["go"] });
      const [[a, b, strength]] = service.getLinks(CODE);
      expect([a, b]).toEqual(["Ann", "Bob"]);
      expect(strength).toBeCloseTo(0.5);
    });

    test("ignores similarity at or below the threshold", async () => {
      embedding.similarity = () => 0.6;
      await service.addAnswer(CODE, { name: "Ann", interests: ["chess"] });
      await service.addAnswer(CODE, { name: "Bob", interests: ["go"] });
      expect(service.getLinks(CODE)).toEqual([]);
    });
  });

  describe("leave and join", () => {
    beforeEach(async () => {
      await service.addAnswer(CODE, { name: "Ann", interests: ["chess"] });
    });

    test("leave marks the answer inactive, then removes it after the TTL", () => {
      const onRemoved = mock();
      expect(service.leave(CODE, "Ann", onRemoved)).toBe(true);
      expect(service.getAnswers(CODE)[0].active).toBe(false);

      jest.advanceTimersByTime(INACTIVE_TTL);
      expect(onRemoved).toHaveBeenCalledTimes(1);
      expect(service.getAnswers(CODE)).toEqual([]);
    });

    test("leave is ignored for participants without an answer", () => {
      expect(service.leave(CODE, "Bob", mock())).toBe(false);
    });

    test("leave is ignored when already pending", () => {
      service.leave(CODE, "Ann", mock());
      expect(service.leave(CODE, "Ann", mock())).toBe(false);
    });

    test("join cancels a pending removal", () => {
      const onRemoved = mock();
      service.leave(CODE, "Ann", onRemoved);
      expect(service.join(CODE, "Ann")).toBe(true);
      expect(service.getAnswers(CODE)[0].active).toBe(true);

      jest.advanceTimersByTime(INACTIVE_TTL);
      expect(onRemoved).not.toHaveBeenCalled();
      expect(service.getAnswers(CODE)).toHaveLength(1);
    });

    test("join without a pending removal changes nothing", () => {
      expect(service.join(CODE, "Ann")).toBe(false);
    });

    test("ending the session cancels pending removals", () => {
      const onRemoved = mock();
      service.leave(CODE, "Ann", onRemoved);
      eventBus.emit("session.ended", CODE);

      jest.advanceTimersByTime(INACTIVE_TTL);
      expect(onRemoved).not.toHaveBeenCalled();
    });
  });
});
