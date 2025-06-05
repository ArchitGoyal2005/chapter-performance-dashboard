import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import { rateLimiter } from "./middlewares/rateLimiting";
import { errorMiddleware } from "./middlewares/error";

import chapterRouter from "./routes/chapterRoutes";

import ErrorHandler from "./utils/Error_Utility_Class";

const app = express();

app.set("trust proxy", true);

app.use(morgan("dev"));

app.use(helmet());

app.use(rateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/chapters", chapterRouter);

app.all("/*path", (req, res, next) => {
  //unexpected route handler
  // This will catch all undefined routes and pass an error to the next middleware
  next(new ErrorHandler(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(errorMiddleware);

export default app;
