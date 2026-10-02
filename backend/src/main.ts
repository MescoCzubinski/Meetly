import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { AppModule } from "./app.module";
import { validateConfig } from "./common/config";

const config = validateConfig();

const app = await NestFactory.create(AppModule);
app.enableCors({ origin: config.corsOrigin });
app.useWebSocketAdapter(new WsAdapter(app));
await app.listen(config.port);
new Logger("Bootstrap").log(`Listening on port ${config.port}`);
