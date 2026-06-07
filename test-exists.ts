import mongoose from "mongoose";
import Topic from "./models/topic.model";
import dotenv from "dotenv";

dotenv.config();

const testExists = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    const exists = await Topic.exists({ slug: "" });
    console.log("Exists:", exists);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

testExists();
