import { NotFoundException } from "@nestjs/common";

export class SessionNotFoundException extends NotFoundException {
  constructor(code: string) {
    super(`Session ${code} not found`);
  }
}
