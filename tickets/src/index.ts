import mongoose from "mongoose";
import { app } from "./app";

const startApplication = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT TOKEN is not defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO URI is not defined");
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongodb!!");
  } catch (e) {
    console.log(e);
  }
  app.listen(3000, () => {
    console.log("Auth-service listening on port 3000!!!");
  });
};

startApplication();
