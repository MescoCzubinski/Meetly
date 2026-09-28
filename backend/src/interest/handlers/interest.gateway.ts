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
import { InterestDto } from "./interest.dto";
import { InterestService } from "../services/interest.service";

@WebSocketGateway({ path: "/interests" })
export class InterestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly clients = new Map<WebSocket, string>();

  constructor(
    private readonly interestService: InterestService,
    eventBus: EventBus,
  ) {
    eventBus.on("session.ended", (code) => {
      for (const [client, clientCode] of this.clients) {
        if (clientCode === code) client.close(4410, "Session ended");
      }
    });
    eventBus.on("participant.joined", (code, name) => {
      if (this.interestService.join(code, name)) this.broadcast(code);
    });
    eventBus.on("participant.left", (code, name) => {
      const left = this.interestService.leave(code, name, () =>
        this.broadcast(code),
      );
      if (left) this.broadcast(code);
    });
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const params = new URLSearchParams(request.url?.split("?")[1]);
    const code = params.get("code") ?? "";
    if (!this.interestService.isActive(code)) {
      client.close(4404, "Session not found");
      return;
    }

    this.clients.set(client, code);
    client.send(this.interestsMessage(code));
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
  }

  @SubscribeMessage("interest")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: () => new WsException("Invalid interest"),
    }),
  )
  async handleAnswer(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() answer: InterestDto,
  ) {
    const code = this.clients.get(client);
    if (!code || !this.interestService.isActive(code)) return;

    await this.interestService.addAnswer(code, answer);

    this.broadcast(code);
  }

  private broadcast(code: string) {
    const message = this.interestsMessage(code);
    for (const [client, clientCode] of this.clients) {
      if (clientCode === code) client.send(message);
    }
  }

  private interestsMessage(code: string) {
    return JSON.stringify({
      event: "interests",
      data: {
        answers: this.interestService.getAnswers(code),
        links: this.interestService.getLinks(code),
      },
    });
  }
}
