import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { config } from "../config";
import { HostAuth } from "./host-auth";
import { ParticipantAuth } from "./participant-auth";

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [HostAuth, ParticipantAuth],
  exports: [HostAuth, ParticipantAuth],
})
export class AuthModule {}
