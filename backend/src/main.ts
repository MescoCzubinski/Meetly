import { Logger } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { AppModule } from "./app.module";
import { serverConfig } from "./common/config";

const app = await NestFactory.create(AppModule);
const { port, corsOrigin } = app.get<ConfigType<typeof serverConfig>>(
  serverConfig.KEY,
);
app.setGlobalPrefix("api");
app.enableCors({ origin: corsOrigin });
app.useWebSocketAdapter(new WsAdapter(app));
app.enableShutdownHooks();
await app.listen(port);
new Logger("Bootstrap").log(`Listening on port ${port}`);
