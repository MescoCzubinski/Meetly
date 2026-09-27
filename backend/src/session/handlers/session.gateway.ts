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
  private readonly clients = new Map<WebSocket, string>();

  constructor(private readonly sessionService: SessionService) {
    sessionService.onExpired((code) => {
      for (const [client, clientCode] of this.clients) {
        if (clientCode === code) client.close(4410, "Session expired");
      }
    });
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const code = new URLSearchParams(request.url?.split("?")[1]).get("code") ?? "";
    try {
      this.sessionService.assertValidSession(code);
    } catch (error) {
      if (!(error instanceof HttpException)) throw error;
      client.close(4000 + error.getStatus(), error.message);
      return;
    }

    this.clients.set(client, code);
    client.send(this.sessionMessage(code));
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
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
    const code = this.clients.get(client);
    if (!code || !this.sessionService.exists(code)) return;

    await this.sessionService.addAnswer(code, answer);

    const message = this.sessionMessage(code);
    for (const [other, otherCode] of this.clients) {
      if (otherCode === code) other.send(message);
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
