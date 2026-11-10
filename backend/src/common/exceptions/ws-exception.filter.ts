import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  Logger,
} from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { DomainException } from "./domain.exception";

// Without this, ValidationPipe errors on gateways surface as internal errors.
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
