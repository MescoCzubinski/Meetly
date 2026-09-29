import type { EmbeddingService } from "../src/interest/services/embedding.service";

export class FakeEmbeddingService implements Pick<
  EmbeddingService,
  "embed" | "similarity"
> {
  embedded: string[][] = [];

  async embed(texts: string[]): Promise<void> {
    this.embedded.push(texts);
  }

  similarity(a: string, b: string): number {
    return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
  }
}
