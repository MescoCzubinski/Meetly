import { beforeEach, describe, expect, mock, test } from "bun:test";

const VECTORS: Record<string, number[]> = {
  chess: [1, 0],
  go: [0.6, 0.8],
  surfing: [0, 1],
};

const extractor = mock(async (texts: string[]) => ({
  tolist: () => texts.map((t) => VECTORS[t]),
}));
const pipeline = mock(async () => extractor);
mock.module("@huggingface/transformers", () => ({ pipeline }));

const { EmbeddingService } = await import("./embedding.service");

let service: InstanceType<typeof EmbeddingService>;

beforeEach(() => {
  extractor.mockClear();
  service = new EmbeddingService();
});

describe("EmbeddingService", () => {
  test("computes the dot product of embedded texts", async () => {
    await service.embed(["chess", "go", "surfing"]);
    expect(service.similarity("chess", "chess")).toBe(1);
    expect(service.similarity("chess", "go")).toBeCloseTo(0.6);
    expect(service.similarity("chess", "surfing")).toBe(0);
  });

  test("returns 0 for texts that were never embedded", async () => {
    await service.embed(["chess"]);
    expect(service.similarity("chess", "go")).toBe(0);
  });

  test("embeds only new, distinct texts", async () => {
    await service.embed(["chess", "chess", "go"]);
    await service.embed(["go", "surfing"]);
    await service.embed(["chess"]);
    expect(extractor.mock.calls.map(([texts]) => texts)).toEqual([
      ["chess", "go"],
      ["surfing"],
    ]);
    expect(extractor).toHaveBeenCalledWith(["chess", "go"], {
      pooling: "mean",
      normalize: true,
    });
  });
});
