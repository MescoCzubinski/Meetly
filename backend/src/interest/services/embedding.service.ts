import { pipeline } from "@huggingface/transformers";
import { Injectable } from "@nestjs/common";

const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

@Injectable()
export class EmbeddingService {
  private readonly extractor = pipeline("feature-extraction", MODEL, {
    dtype: "q8",
  });
  private readonly vectors = new Map<string, Map<string, number[]>>();

  async embed(code: string, texts: string[]): Promise<void> {
    const cache = this.vectors.get(code) ?? new Map<string, number[]>();
    this.vectors.set(code, cache);

    const missing = [...new Set(texts)].filter((t) => !cache.has(t));
    if (missing.length === 0) return;

    const extractor = await this.extractor;
    const output = await extractor(missing, {
      pooling: "mean",
      normalize: true,
    });
    (output.tolist() as number[][]).forEach((vector, i) =>
      cache.set(missing[i], vector),
    );
  }

  similarity(code: string, a: string, b: string): number {
    const cache = this.vectors.get(code);
    const x = cache?.get(a);
    const y = cache?.get(b);
    if (!x || !y) return 0;
    return x.reduce((sum, v, i) => sum + v * y[i], 0);
  }

  deleteSession(code: string): void {
    this.vectors.delete(code);
  }
}
