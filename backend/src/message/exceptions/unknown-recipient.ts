import { DomainException } from "../../common/exceptions/domain.exception";

export class UnknownRecipientException extends DomainException {
  constructor() {
    super("not-found", "Unknown recipient");
  }
}
