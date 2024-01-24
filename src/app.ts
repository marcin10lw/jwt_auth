require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import config from "config";
import connectDb from "./utils/connectDB";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";

const app = express();

app.use(express.json({ limit: "10kb" }));

app.use(cookieParser());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(
  cors({
    origin: config.get<string>("origin"),
    credentials: true,
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.get("/healthCheck", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Welcome",
  });
});

app.all("*", (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as any;
  error.statusCode = 404;
  next(error);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const port = config.get<number>("port");

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
  connectDb();
});
