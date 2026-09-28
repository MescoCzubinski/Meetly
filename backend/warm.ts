// Downloads the embedding model into the cache next to the package
import { EmbeddingService } from "./src/interest/services/embedding.service";

await new EmbeddingService().embed(["warmup"]);
