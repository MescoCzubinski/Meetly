import type { IncomingMessage } from "node:http";
import { HttpException } from "@nestjs/common";
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
} from "@nestjs/websockets";
import type { WebSocket } from "ws";
import { ParticipantAuth } from "../../common/auth/participant-auth";
import { EventBus } from "../../common/events/event-bus";
import { SessionService } from "../services/session.service";

@WebSocketGateway({ path: "/session" })
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly clients = new Map<
    WebSocket,
    { code: string; name?: string }
  >();

  constructor(
    private readonly sessionService: SessionService,
    private readonly participantAuth: ParticipantAuth,
    eventBus: EventBus,
  ) {
    eventBus.on("session.ended", (code) => {
      for (const [client, info] of this.clients) {
        if (info.code === code) client.close(4410, "Session ended");
      }
    });
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const params = new URLSearchParams(request.url?.split("?")[1]);
    const token = params.get("token");
    const participant = token !== null
      ? this.participantAuth.verifyToken(token)
      : { code: params.get("code") ?? "", name: undefined };
    if (!participant) {
      client.close(4401, "Invalid token");
      return;
    }
    const { code, name } = participant;
    try {
      this.sessionService.assertValidSession(code);
    } catch (error) {
      if (!(error instanceof HttpException)) throw error;
      client.close(4000 + error.getStatus(), error.message);
      return;
    }

    this.clients.set(client, { code, name });
    this.sessionService.cancelEmptyEnd(code);
    if (name) this.sessionService.join(code, name);
  }

  handleDisconnect(client: WebSocket) {
    const info = this.clients.get(client);
    this.clients.delete(client);
    if (!info) return;
    const { code, name } = info;

    const others = [...this.clients.values()].filter(
      (other) => other.code === code,
    );
    if (others.length === 0) this.sessionService.scheduleEmptyEnd(code);
    if (!name || others.some((other) => other.name === name)) return;

    this.sessionService.leave(code, name);
  }
}
