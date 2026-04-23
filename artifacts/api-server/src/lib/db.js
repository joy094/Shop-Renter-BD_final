import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer = null;

export async function connectDB() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log("Using in-memory MongoDB at", uri);
  } else {
    console.log("Connecting to MongoDB at", uri.replace(/:[^:@/]+@/, ":***@"));
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "dokan_bhara" });
  console.log("MongoDB connected");
}
