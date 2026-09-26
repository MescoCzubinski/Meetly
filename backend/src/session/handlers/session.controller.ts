import { Controller, Get, Param, Post } from "@nestjs/common";
import { SessionService } from "../services/session.service";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create() {
    return { code: this.sessionService.create() };
  }

  @Get(":code")
  get(@Param("code") code: string) {
    this.sessionService.assertExists(code);
    return { code };
  }
}
