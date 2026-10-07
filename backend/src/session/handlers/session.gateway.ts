import type { IncomingMessage } from "node:http";
import { HttpException, Logger } from "@nestjs/common";
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
} from "@nestjs/websockets";
import type { WebSocket } from "ws";
import { ParticipantAuth } from "../../common/auth/participant-auth";
import { EventBus } from "../../common/events/event-bus";
import { SessionService } from "../services/session.service";

const MAX_ANONYMOUS_CONNECTIONS = 10;

@WebSocketGateway({ path: "/api/session" })
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SessionGateway.name);
  private readonly clients = new Map<
    WebSocket,
    { code: string; name?: string }
  >();
  private readonly anonymousConnections = new Map<string, number>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly participantAuth: ParticipantAuth,
    eventBus: EventBus,
  ) {
    eventBus.on("session.ended", (code) => {
      for (const [client, info] of this.clients) {
        if (info.code === code) client.close(4410, "Session ended");
      }
      this.anonymousConnections.delete(code);
    });
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const params = new URLSearchParams(request.url?.split("?")[1]);
    const token = params.get("token");
    const participant =
      token !== null
        ? this.participantAuth.verifyToken(token)
        : { code: params.get("code") ?? "", name: undefined };
    if (!participant) {
      this.logger.warn("Connection rejected: invalid token");
      client.close(4401, "Invalid token");
      return;
    }
    const { code, name } = participant;
    try {
      this.sessionService.assertValidSession(code);
    } catch (error) {
      if (!(error instanceof HttpException)) throw error;
      this.logger.warn(`Connection to ${code} rejected: ${error.message}`);
      client.close(4000 + error.getStatus(), error.message);
      return;
    }

    if (!name) {
      const count = this.anonymousConnections.get(code) ?? 0;
      if (count >= MAX_ANONYMOUS_CONNECTIONS) {
        this.logger.warn(
          `Connection to ${code} rejected: too many anonymous connections`,
        );
        client.close(4429, "Too many connections");
        return;
      }
      this.anonymousConnections.set(code, count + 1);
    }

    this.clients.set(client, { code, name });
    this.sessionService.connect(code, name);
  }

  handleDisconnect(client: WebSocket) {
    const info = this.clients.get(client);
    this.clients.delete(client);
    if (!info) return;
    this.sessionService.disconnect(info.code, info.name);
    if (!info.name) {
      const count = this.anonymousConnections.get(info.code) ?? 0;
      if (count <= 1) this.anonymousConnections.delete(info.code);
      else this.anonymousConnections.set(info.code, count - 1);
    }
  }
}
