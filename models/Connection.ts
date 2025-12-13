// models/Connection.ts
import mongoose, { Schema, models, model } from "mongoose";

export interface IConnection {
  _id?: string;
  requesterId: string;   // who sent request
  receiverId: string;    // who receives
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    requesterId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

// prevent duplicate requests
ConnectionSchema.index(
  { requesterId: 1, receiverId: 1 },
  { unique: true }
);

const ConnectionModel =
  models.Connection || model<IConnection>("Connection", ConnectionSchema);

export default ConnectionModel;
