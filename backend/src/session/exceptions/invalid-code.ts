import { BadRequestException } from "@nestjs/common";

export class InvalidSessionCodeException extends BadRequestException {
  constructor() {
    super("Code must be 6 digits long");
  }
}
