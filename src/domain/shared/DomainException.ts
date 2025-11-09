export class DomainException extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message || code);
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends DomainException {
  constructor(code: string, message?: string) {
    super(code, message);
  }
}

export class ValidationException extends DomainException {
  constructor(code: string, message?: string) {
    super(code, message);
  }
}

export class AuthorizationException extends DomainException {
  constructor(code: string, message?: string) {
    super(code, message);
  }
}

