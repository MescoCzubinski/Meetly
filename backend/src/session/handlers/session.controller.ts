import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";
import { SessionService } from "../services/session.service";

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

  @Delete(":code")
  @HttpCode(204)
  end(
    @Param("code") code: string,
    @Headers("x-host-token") hostToken: string = "",
  ) {
    this.sessionService.end(code, hostToken);
  }
}
