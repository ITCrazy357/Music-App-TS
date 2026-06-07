import mongoose from "mongoose";
import Topic from "./models/topic.model";
import dotenv from "dotenv";

dotenv.config();

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    const indexes = await Topic.collection.indexes();
    console.log("Topic Indexes:", indexes);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

checkIndexes();
