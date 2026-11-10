import { Global, Module } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { authConfig } from "../config";
import { HostAuth } from "./host-auth";
import { ParticipantAuth } from "./participant-auth";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (auth: ConfigType<typeof authConfig>) => ({
        secret: auth.jwtSecret,
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  providers: [HostAuth, ParticipantAuth],
  exports: [HostAuth, ParticipantAuth],
})
export class AuthModule {}
