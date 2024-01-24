import mongoose from "mongoose";
import config from "config";

const dbUrl = `mongodb://${config.get("dbName")}:${config.get(
  "dbPass"
)}@localhost:6000/jwtAuth?authSource=admin`;

const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database connected...");
  } catch (error) {
    console.log(error);
    setTimeout(connectDb, 5000);
  }
};

export default connectDb;
