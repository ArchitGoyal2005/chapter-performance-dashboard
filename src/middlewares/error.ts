import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/Error_Utility_Class";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") err.message = "Invalid ID";

  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map(
      (error: any) => error.message
    );
    err.message = validationErrors.join(", ");
    err.statusCode = 400;
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[0];
    err.message = `${duplicateField} already exists`;
    err.statusCode = 400;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const TryCatch =
  (
    func: (req: Request, res: Response, next: NextFunction) => Promise<void> //controller function type
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
