import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class HostAuth {
  constructor(private readonly jwtService: JwtService) {}

  sign(code: string): string {
    return this.jwtService.sign({ code, role: "host" });
  }

  isHost(token: string, code: string): boolean {
    try {
      const payload = this.jwtService.verify<{ code: string; role: string }>(
        token,
      );
      return payload.role === "host" && payload.code === code;
    } catch {
      return false;
    }
  }
}
