import type { IncomingMessage } from "node:http";
import { Logger, UseFilters } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import type { WebSocket } from "ws";
import { ParticipantAuth } from "../../common/auth/participant-auth";
import { EventBus } from "../../common/events/event-bus";
import { WsExceptionFilter } from "../../common/exceptions/ws-exception.filter";
import { RateLimit } from "../../common/rate-limit.guard";
import { MessageDto } from "./message.dto";
import { MessageService } from "../services/message.service";

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds

@WebSocketGateway({ path: "/api/messages" })
@UseFilters(new WsExceptionFilter())
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessageGateway.name);
  private readonly clients = new Map<
    WebSocket,
    { code: string; name: string }
  >();

  constructor(
    private readonly messageService: MessageService,
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
    const participant = this.participantAuth.verify(request);
    if (!participant) {
      this.logger.warn("Connection rejected: invalid token");
      client.close(4401, "Invalid token");
      return;
    }
    const { code, name } = participant;
    if (!this.messageService.isActive(code)) {
      this.logger.warn(`Connection to ${code} rejected: session not found`);
      client.close(4404, "Session not found");
      return;
    }

    this.clients.set(client, { code, name });
    client.send(
      JSON.stringify({
        event: "messages",
        data: this.messageService.getFor(code, name),
      }),
    );
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
  }

  @SubscribeMessage("message")
  @RateLimit({
    limit: RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW,
    message: "Too many messages, slow down",
  })
  handleMessage(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: MessageDto,
  ) {
    const info = this.clients.get(client);
    if (!info || !this.messageService.isActive(info.code)) return;

    const message = this.messageService.send(
      info.code,
      info.name,
      body.to,
      body.text,
    );
    const payload = JSON.stringify({ event: "message", data: message });
    for (const [other, { code, name }] of this.clients) {
      if (code === info.code && (name === message.from || name === message.to))
        other.send(payload);
    }
  }
}
