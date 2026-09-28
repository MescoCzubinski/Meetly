import { pipeline } from "@huggingface/transformers";
import { Injectable } from "@nestjs/common";

const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

@Injectable()
export class EmbeddingService {
  private readonly extractor = pipeline("feature-extraction", MODEL, {
    dtype: "q8",
  });
  private readonly vectors = new Map<string, number[]>();

  async embed(texts: string[]): Promise<void> {
    const missing = [...new Set(texts)].filter((t) => !this.vectors.has(t));
    if (missing.length === 0) return;

    const extractor = await this.extractor;
    const output = await extractor(missing, {
      pooling: "mean",
      normalize: true,
    });
    (output.tolist() as number[][]).forEach((vector, i) =>
      this.vectors.set(missing[i], vector),
    );
  }

  similarity(a: string, b: string): number {
    const x = this.vectors.get(a);
    const y = this.vectors.get(b);
    if (!x || !y) return 0;
    return x.reduce((sum, v, i) => sum + v * y[i], 0);
  }
}
