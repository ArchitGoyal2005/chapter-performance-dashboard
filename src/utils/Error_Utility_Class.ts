class ErrorHandler extends Error {
  public statusCode: number;
  public code?: number; // For MongoDB duplicate key errors (11000)
  public errors?: any; // For Mongoose validation errors
  public keyValue?: any; // For MongoDB duplicate key error details

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
