import {
  type FeatureExtractionPipeline,
  pipeline,
} from "@huggingface/transformers";
import { Injectable, Logger } from "@nestjs/common";

const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractor?: Promise<FeatureExtractionPipeline>;
  private readonly vectors = new Map<string, Map<string, number[]>>();

  createSession(code: string): void {
    this.vectors.set(code, new Map());
    this.load();
  }

  async embed(code: string, texts: string[]): Promise<void> {
    const cache = this.vectors.get(code) ?? new Map<string, number[]>();
    this.vectors.set(code, cache);

    const missing = [...new Set(texts)].filter((t) => !cache.has(t));
    if (missing.length === 0) return;

    const extractor = await this.load();
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
    if (this.vectors.size > 0) return;
    const extractor = this.extractor;
    this.extractor = undefined;
    void extractor?.then(
      (e) => e.dispose(),
      () => {},
    );
  }

  private load(): Promise<FeatureExtractionPipeline> {
    if (!this.extractor) {
      const loading = pipeline("feature-extraction", MODEL, { dtype: "q8" });
      loading.catch((error) => {
        this.logger.error("Failed to load the embedding model", error);
        if (this.extractor === loading) this.extractor = undefined;
      });
      this.extractor = loading;
    }
    return this.extractor;
  }
}
