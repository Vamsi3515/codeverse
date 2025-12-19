class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const errorResponse = (error, req, res) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (error.name === 'CastError') {
    const message = `Resource not found. Invalid: ${error.path}`;
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new AppError(message, 400);
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    const message = `JSON Web Token is invalid, try again`;
    error = new AppError(message, 400);
  }

  // JWT expire error
  if (error.name === 'TokenExpiredError') {
    const message = `JSON Web Token is expired, try again`;
    error = new AppError(message, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

module.exports = {
  AppError,
  catchAsync,
  errorResponse,
};
