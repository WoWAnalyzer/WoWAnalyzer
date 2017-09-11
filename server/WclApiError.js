class WclApiError extends Error {
  constructor(message, status) {
    super(message);

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    // You can use any additional properties you want.
    // I'm going to use preferred HTTP status for this error types.
    // `500` is the default value if not specified.
    this.statusCode = status || 500;
  }
}

export default WclApiError;
