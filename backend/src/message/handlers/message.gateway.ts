import type { IncomingMessage } from "node:http";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from "@nestjs/websockets";
import type { WebSocket } from "ws";
import { EventBus } from "../../common/events/event-bus";
import { MessageDto } from "./message.dto";
import { MessageService } from "../services/message.service";

@WebSocketGateway({ path: "/messages" })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly clients = new Map<
    WebSocket,
    { code: string; name: string }
  >();

  constructor(
    private readonly messageService: MessageService,
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
    const code = params.get("code") ?? "";
    const name = params.get("name") ?? "";
    if (!this.messageService.isActive(code)) {
      client.close(4404, "Session not found");
      return;
    }
    if (!name) {
      client.close(4400, "Name is required");
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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: () => new WsException("Invalid message"),
    }),
  )
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
