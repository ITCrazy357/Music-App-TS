import mongoose from "mongoose";
import Topic from "./models/topic.model";
import { convertToSlug } from "./helpers/convertToSlug";
import dotenv from "dotenv";

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Connected to MongoDB");

    const title = "Test Topic Slug";
    const slugInput = "   "; // Simulate empty input
    const status = "active";

    let baseSlug = slugInput && slugInput.trim() !== "" ? convertToSlug(slugInput.trim()) : convertToSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await Topic.exists({ slug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const payload: any = {
      title,
      description: "Test description",
      status: status || "inactive",
      slug: slug,
    };

    const createdBy = {
      account_id: "mockId",
      createdAt: new Date(),
    };

    const topic = new Topic({
      ...payload,
      createdBy: createdBy,
    });
    console.log("Topic to save:", topic);
    await topic.save();
    console.log("Topic saved successfully:", topic);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

test();
