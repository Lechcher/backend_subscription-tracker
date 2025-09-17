export class HandlerError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HandlerError";
    // Fix prototype chain for Error subclassing in TypeScript
    Object.setPrototypeOf(this, HandlerError.prototype);
  }
}
