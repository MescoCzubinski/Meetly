import type { IncomingMessage } from "node:http";
import { describe, expect, test } from "bun:test";
import { JwtService } from "@nestjs/jwt";
import { HostAuth } from "./host-auth";
import { ParticipantAuth } from "./participant-auth";

const jwtService = new JwtService({ secret: "secret" });
const participantAuth = new ParticipantAuth(jwtService);

describe("ParticipantAuth", () => {
  test("verifyToken rejects a host token", () => {
    const token = new HostAuth(jwtService).sign("123456");
    expect(participantAuth.verifyToken(token)).toBeUndefined();
  });

  test("verify rejects a request without a token", () => {
    const request = { url: "/messages" } as IncomingMessage;
    expect(participantAuth.verify(request)).toBeUndefined();
  });
});
