import express from "express";
import morgan from "morgan";

import chapterRouter from "./routes/chapterRoutes";
import { rateLimiter } from "./middlewares/rateLimiting";

const app = express();

app.set("trust proxy", true);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/chapters", chapterRouter);

export default app;
