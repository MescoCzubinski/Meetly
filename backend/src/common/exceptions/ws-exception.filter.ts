import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  Logger,
} from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { DomainException } from "./domain.exception";

// The global ValidationPipe also runs on gateway payloads and throws
// BadRequestException there, which the base filter would report as an
// internal error.
@Catch(DomainException, BadRequestException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  override catch(
    exception: DomainException | BadRequestException,
    host: ArgumentsHost,
  ): void {
    const message =
      exception instanceof DomainException
        ? exception.message
        : `Invalid ${host.switchToWs().getPattern()}`;
    this.logger.warn(message);
    super.catch(new WsException(message), host);
  }
}
