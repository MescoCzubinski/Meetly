import type { EmbeddingService } from "../src/interest/services/embedding.service";

export class FakeEmbeddingService implements Pick<
  EmbeddingService,
  "embed" | "similarity" | "createSession" | "deleteSession"
> {
  embedded: string[][] = [];

  async embed(code: string, texts: string[]): Promise<void> {
    this.embedded.push(texts);
  }

  similarity(code: string, a: string, b: string): number {
    return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
  }

  createSession(_code: string): void {}

  deleteSession(_code: string): void {}
}
