import type { IncomingMessage } from "node:http";
import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
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
import { ParticipantAuth } from "../../common/auth/participant-auth";
import { EventBus } from "../../common/events/event-bus";
import { RateLimiter } from "../../common/rate-limit";
import { InterestDto } from "./interest.dto";
import { InterestService } from "../services/interest.service";

const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds

@WebSocketGateway({ path: "/api/interests" })
export class InterestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(InterestGateway.name);
  private readonly clients = new Map<
    WebSocket,
    { code: string; name: string }
  >();
  private readonly limiter = new RateLimiter(RATE_LIMIT, RATE_LIMIT_WINDOW);

  constructor(
    private readonly interestService: InterestService,
    private readonly participantAuth: ParticipantAuth,
    eventBus: EventBus,
  ) {
    eventBus.on("session.ended", (code) => {
      for (const [client, info] of this.clients) {
        if (info.code === code) client.close(4410, "Session ended");
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
    const participant = this.participantAuth.verify(request);
    if (!participant) {
      this.logger.warn("Connection rejected: invalid token");
      client.close(4401, "Invalid token");
      return;
    }
    const { code } = participant;
    if (!this.interestService.isActive(code)) {
      this.logger.warn(`Connection to ${code} rejected: session not found`);
      client.close(4404, "Session not found");
      return;
    }

    this.clients.set(client, participant);
    client.send(this.interestsMessage(code));
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
    this.limiter.delete(client);
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
    @MessageBody() body: InterestDto,
  ) {
    const info = this.clients.get(client);
    if (!info || !this.interestService.isActive(info.code)) return;
    if (!this.limiter.consume(client))
      throw new WsException("Too many updates, slow down");

    await this.interestService.addAnswer(info.code, {
      name: info.name,
      interests: body.interests,
    });

    this.broadcast(info.code);
  }

  private broadcast(code: string) {
    const message = this.interestsMessage(code);
    for (const [client, info] of this.clients) {
      if (info.code === code) client.send(message);
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
