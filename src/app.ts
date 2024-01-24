require("dotenv").config();
import express from "express";
import config from "config";
import connectDb from "./utils/connectDB";

const app = express();

const port = config.get<number>("port");

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
  connectDb();
});
