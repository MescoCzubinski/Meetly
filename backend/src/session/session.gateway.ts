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
import { AnswerDto } from "./answer.dto";
import { SessionService } from "./session.service";

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
    if (!this.sessionService.exists(code)) {
      client.close(4404, "Session not found");
      return;
    }

    this.clients.set(client, code);
    client.send(
      JSON.stringify({
        event: "answers",
        data: this.sessionService.getAnswers(code),
      }),
    );
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
  handleAnswer(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() answer: AnswerDto,
  ) {
    const code = this.clients.get(client);
    if (!code || !this.sessionService.exists(code)) return;

    this.sessionService.addAnswer(code, answer);

    const message = JSON.stringify({ event: "answer", data: answer });
    for (const [other, otherCode] of this.clients) {
      if (otherCode === code) other.send(message);
    }
  }
}
