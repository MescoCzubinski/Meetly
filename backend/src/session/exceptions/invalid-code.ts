import { DomainException } from "../../common/exceptions/domain.exception";

export class InvalidSessionCodeException extends DomainException {
  constructor() {
    super("invalid", "Code must be 6 digits long");
  }
}
