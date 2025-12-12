// models/Post.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IPostDoc {
  _id?: string;
  authorId: string;
  authorName?: string | null;
  authorImage?: string | null;
  content: string;
  imageUrl?: string | null;
  createdAt?: Date;
  likes: string[];
  comments: string[]; // array of comment ids
}

const PostSchema = new Schema<IPostDoc>({
  authorId: { type: String, required: true },
  authorName: { type: String, default: null },
  authorImage: { type: String, default: null },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
  likes: { type: [String], default: [] },
  comments: { type: [String], default: [] }, // store comment ids
});

const PostModel = models.Post || model<IPostDoc>('Post', PostSchema);
export default PostModel;
