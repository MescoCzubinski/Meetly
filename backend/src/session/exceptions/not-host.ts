import { DomainException } from "../../common/exceptions/domain.exception";

export class NotHostException extends DomainException {
  constructor() {
    super("forbidden", "Only the host can end the session");
  }
}
