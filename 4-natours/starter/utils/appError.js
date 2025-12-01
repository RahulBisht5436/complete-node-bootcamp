// ------------------------------------------------------------
// Custom AppError Class
// Extends the built-in Error object to create operational,
// predictable errors that we can safely send to clients.
// ------------------------------------------------------------
class AppError extends Error {

  constructor(message, statusCode) {
    super(message);   // Call parent class (Error) constructor to set the error message

    // HTTP status code (400, 404, 500, etc.)
    this.statusCode = statusCode;

    // Determine error type:
    // 4xx → 'fail' (client error)
    // 5xx → 'error' (server error)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Mark the error as "operational"
    // Operational errors are expected & safe to send to clients
    // (ex: invalid input, not found, unauthorized)
    this.isOperational = true;

    // Capture the stack trace without including the constructor call in it
    Error.captureStackTrace(this, this.constructor);
  }
}

// Export custom error class
module.exports = AppError;
