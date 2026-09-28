import { EventEmitter } from "node:events";
import { Injectable } from "@nestjs/common";

interface Events {
  "session.created": [code: string];
  "session.ended": [code: string];
  "participant.joined": [code: string, name: string];
  "participant.left": [code: string, name: string];
}

@Injectable()
export class EventBus extends EventEmitter<Events> {}
