import {
  applyDecorators,
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UseGuards,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WsException } from "@nestjs/websockets";
import { RateLimiter } from "./rate-limit";

type RateLimitOptions = { limit: number; windowMs: number; message: string };

const RATE_LIMIT = Reflector.createDecorator<RateLimitOptions>();

@Injectable()
export class WsRateLimitGuard implements CanActivate {
  private readonly limiters = new Map<object, RateLimiter>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const { limit, windowMs, message } = this.reflector.get(
      RATE_LIMIT,
      handler,
    );
    const limiter =
      this.limiters.get(handler) ?? new RateLimiter(limit, windowMs);
    this.limiters.set(handler, limiter);
    if (!limiter.consume(context.switchToWs().getClient<object>()))
      throw new WsException(message);
    return true;
  }
}

export const RateLimit = (options: RateLimitOptions) =>
  applyDecorators(RATE_LIMIT(options), UseGuards(WsRateLimitGuard));
