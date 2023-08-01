import { CustomError } from "./custom-error";

export class NotAuthorized extends CustomError {
  constructor() {
    super("Not authorized");
    Object.setPrototypeOf(this, NotAuthorized.prototype);
  }
  statusCode = 401;
  serializeErrors() {
    return [
      {
        message: "Not authorized!",
      },
    ];
  }
}
