import { DomainException } from "../../common/exceptions/domain.exception";

export class SessionNotFoundException extends DomainException {
  constructor(code: string) {
    super("not-found", `Session ${code} not found`);
  }
}
