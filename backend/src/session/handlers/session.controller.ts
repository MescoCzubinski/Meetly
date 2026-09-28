import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  ValidationPipe,
} from "@nestjs/common";
import { SessionService } from "../services/session.service";
import { ParticipantDto } from "./participant.dto";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create() {
    return this.sessionService.create();
  }

  @Get(":code")
  get(@Param("code") code: string) {
    this.sessionService.assertValidSession(code);
    return { code };
  }

  @Post(":code/participants")
  register(
    @Param("code") code: string,
    @Body(new ValidationPipe({ whitelist: true })) body: ParticipantDto,
  ) {
    return this.sessionService.register(code, body.name);
  }

  @Delete(":code")
  @HttpCode(204)
  end(
    @Param("code") code: string,
    @Headers("x-host-token") hostToken: string = "",
  ) {
    this.sessionService.end(code, hostToken);
  }
}
