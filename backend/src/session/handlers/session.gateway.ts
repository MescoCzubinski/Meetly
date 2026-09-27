import type { IncomingMessage } from "node:http";
import { HttpException, UsePipes, ValidationPipe } from "@nestjs/common";
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
import { AnswerDto } from "./answer.dto";
import { SessionService } from "../services/session.service";

@WebSocketGateway({ path: "/session" })
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly clients = new Map<
    WebSocket,
    { code: string; name?: string }
  >();

  constructor(private readonly sessionService: SessionService) {
    sessionService.onEnded((code) => {
      for (const [client, info] of this.clients) {
        if (info.code === code) client.close(4410, "Session ended");
      }
    });
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const params = new URLSearchParams(request.url?.split("?")[1]);
    const code = params.get("code") ?? "";
    const name = params.get("name") || undefined;
    try {
      this.sessionService.assertValidSession(code);
    } catch (error) {
      if (!(error instanceof HttpException)) throw error;
      client.close(4000 + error.getStatus(), error.message);
      return;
    }

    this.clients.set(client, { code, name });
    this.sessionService.cancelEmptyEnd(code);
    if (name && this.sessionService.join(code, name)) this.broadcast(code);
    else client.send(this.sessionMessage(code));
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

    const left = this.sessionService.leave(code, name, () =>
      this.broadcast(code),
    );
    if (left) this.broadcast(code);
  }

  @SubscribeMessage("answer")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: () => new WsException("Invalid answer"),
    }),
  )
  async handleAnswer(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() answer: AnswerDto,
  ) {
    const info = this.clients.get(client);
    if (!info || !this.sessionService.exists(info.code)) return;

    await this.sessionService.addAnswer(info.code, answer);

    this.broadcast(info.code);
  }

  private broadcast(code: string) {
    const message = this.sessionMessage(code);
    for (const [client, info] of this.clients) {
      if (info.code === code) client.send(message);
    }
  }

  private sessionMessage(code: string) {
    return JSON.stringify({
      event: "session",
      data: {
        answers: this.sessionService.getAnswers(code),
        links: this.sessionService.getLinks(code),
      },
    });
  }
}
