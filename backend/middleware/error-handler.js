import HttpError from "../utils/http-error.js";

/** Terminal middleware: turns any unmatched route into a 404 HttpError. */
export const notFoundHandler = (req, res, next) => {
  next(HttpError.notFound("Route not found"));
};

/** Maps common Mongoose failures onto HttpErrors. */
const normalizeError = (error) => {
  if (error instanceof HttpError) {
    return error;
  }

  if (error?.type === "entity.parse.failed") {
    return HttpError.badRequest("Invalid JSON payload");
  }

  // Honor client errors raised by middleware (e.g. body-parser) instead of
  // masking them as 500.
  const status = error?.statusCode ?? error?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    return new HttpError(status, error.message || "Request error");
  }

  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors ?? {}).map((entry) => ({
      field: entry.path,
      message: entry.message,
    }));
    return HttpError.badRequest("Validation failed", errors);
  }

  if (error?.name === "CastError") {
    return HttpError.badRequest(`Invalid ${error.path}`);
  }

  if (error?.code === 11000) {
    return HttpError.conflict("Resource already exists");
  }

  return error;
};

// eslint-disable-next-line no-unused-vars -- Express requires the 4-arg signature
export const errorHandler = (error, req, res, next) => {
  const normalized = normalizeError(error);

  if (normalized instanceof HttpError) {
    const body = {
      success: false,
      message: normalized.message,
    };
    if (normalized.errors) {
      body.errors = normalized.errors;
    }
    return res.status(normalized.statusCode).json(body);
  }

  console.error("Unhandled error:", normalized);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
