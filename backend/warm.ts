// Downloads the embedding model into the cache next to the package
import { EmbeddingService } from "./src/session/services/embedding.service";

await new EmbeddingService().embed(["warmup"]);
