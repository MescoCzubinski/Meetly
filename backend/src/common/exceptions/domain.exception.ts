export type ExceptionKind = "invalid" | "forbidden" | "not-found";

export class DomainException extends Error {
  constructor(
    readonly kind: ExceptionKind,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
