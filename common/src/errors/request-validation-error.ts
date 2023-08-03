import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";
export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("Invalid request params!");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(({ msg, type }) => ({
      message: msg,
      field: type,
    }));
  }
}
