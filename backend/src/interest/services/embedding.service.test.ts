import { beforeEach, describe, expect, mock, test } from "bun:test";

const VECTORS: Record<string, number[]> = {
  chess: [1, 0],
  go: [0.6, 0.8],
  surfing: [0, 1],
};

const extractor = mock(async (texts: string[]) => ({
  tolist: () => texts.map((t) => VECTORS[t]),
}));
const dispose = mock(async () => {});
const pipeline = mock(async () => Object.assign(extractor, { dispose }));
mock.module("@huggingface/transformers", () => ({ pipeline }));

const { EmbeddingService } = await import("./embedding.service");

const CODE = "111111";
const OTHER_CODE = "222222";

let service: InstanceType<typeof EmbeddingService>;

beforeEach(() => {
  extractor.mockClear();
  pipeline.mockClear();
  dispose.mockClear();
  service = new EmbeddingService();
});

describe("EmbeddingService", () => {
  test("computes the dot product of embedded texts", async () => {
    await service.embed(CODE, ["chess", "go", "surfing"]);
    expect(service.similarity(CODE, "chess", "chess")).toBe(1);
    expect(service.similarity(CODE, "chess", "go")).toBeCloseTo(0.6);
    expect(service.similarity(CODE, "chess", "surfing")).toBe(0);
  });

  test("returns 0 for texts that were never embedded", async () => {
    await service.embed(CODE, ["chess"]);
    expect(service.similarity(CODE, "chess", "go")).toBe(0);
  });

  test("embeds only new, distinct texts within a session", async () => {
    await service.embed(CODE, ["chess", "chess", "go"]);
    await service.embed(CODE, ["go", "surfing"]);
    await service.embed(CODE, ["chess"]);
    expect(extractor.mock.calls.map(([texts]) => texts)).toEqual([
      ["chess", "go"],
      ["surfing"],
    ]);
    expect(extractor).toHaveBeenCalledWith(["chess", "go"], {
      pooling: "mean",
      normalize: true,
    });
  });

  test("keeps each session's vectors separate, and frees them on deleteSession", async () => {
    await service.embed(CODE, ["chess"]);
    expect(service.similarity(OTHER_CODE, "chess", "chess")).toBe(0);

    service.deleteSession(CODE);
    expect(service.similarity(CODE, "chess", "chess")).toBe(0);
  });

  test("loads the model on session creation and disposes it after the last session ends", async () => {
    service.createSession(CODE);
    service.createSession(OTHER_CODE);
    expect(pipeline).toHaveBeenCalledTimes(1);

    service.deleteSession(CODE);
    await Promise.resolve();
    expect(dispose).not.toHaveBeenCalled();

    service.deleteSession(OTHER_CODE);
    await new Promise((r) => setTimeout(r));
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test("retries loading the model after a failed load", async () => {
    pipeline.mockImplementationOnce(async () => {
      throw new Error("offline");
    });
    service.createSession(CODE);
    await new Promise((r) => setTimeout(r));

    await service.embed(CODE, ["chess"]);
    expect(pipeline).toHaveBeenCalledTimes(2);
    expect(service.similarity(CODE, "chess", "chess")).toBe(1);
  });

  test("does not dispose a model that failed to load", async () => {
    pipeline.mockImplementationOnce(async () => {
      throw new Error("offline");
    });
    service.createSession(CODE);
    service.deleteSession(CODE);
    await new Promise((r) => setTimeout(r));
    expect(dispose).not.toHaveBeenCalled();
  });
});
