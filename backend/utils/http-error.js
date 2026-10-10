class HttpError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    if (errors) {
      this.errors = errors;
    }
  }

  static badRequest(message, errors) {
    return new HttpError(400, message, errors);
  }

  static unauthorized(message = "Authentication required") {
    return new HttpError(401, message);
  }

  static forbidden(
    message = "You do not have permission to perform this action",
  ) {
    return new HttpError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new HttpError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new HttpError(409, message);
  }
}

export default HttpError;
