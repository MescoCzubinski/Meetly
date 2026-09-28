import type { IncomingMessage } from "node:http";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export interface Participant {
  code: string;
  name: string;
}

@Injectable()
export class ParticipantAuth {
  constructor(private readonly jwtService: JwtService) {}

  sign(participant: Participant): string {
    return this.jwtService.sign({ ...participant, role: "participant" });
  }

  verify(request: IncomingMessage): Participant | undefined {
    const params = new URLSearchParams(request.url?.split("?")[1]);
    return this.verifyToken(params.get("token") ?? "");
  }

  verifyToken(token: string): Participant | undefined {
    try {
      const { code, name, role } = this.jwtService.verify<
        Participant & { role: string }
      >(token);
      return role === "participant" ? { code, name } : undefined;
    } catch {
      return undefined;
    }
  }
}
