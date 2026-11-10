import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { DomainException } from "./domain.exception";
import { HTTP_STATUS } from "./http-status";

@Catch(DomainException)
export class HttpExceptionFilter implements ExceptionFilter<DomainException> {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const { statusCode, error } = HTTP_STATUS[exception.kind];
    const { httpAdapter } = this.adapterHost;
    const request: unknown = host.switchToHttp().getRequest();
    this.logger.warn(
      `${httpAdapter.getRequestMethod(request)} ${httpAdapter.getRequestUrl(request)} rejected with ${statusCode}: ${exception.message}`,
    );
    httpAdapter.reply(
      host.switchToHttp().getResponse(),
      { statusCode, error, message: exception.message },
      statusCode,
    );
  }
}
