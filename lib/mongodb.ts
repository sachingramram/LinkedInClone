import { MongoClient } from "mongodb";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

const uri = process.env.MONGODB_URI;

// ---- Global type declarations ----
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

// ---- Create MongoClient only once (cached globally) ----
const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ??
  (global._mongoClientPromise = new MongoClient(uri).connect());

// ---- Mongoose connection for models ----
export async function mongooseConnect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(uri);
  }

  await global._mongoosePromise;
  return mongoose;
}

export default clientPromise;
