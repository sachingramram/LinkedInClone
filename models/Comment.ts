// models/Comment.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface ICommentDoc {
  _id?: string;
  postId: string;
  authorId: string;
  authorName?: string | null;
  content: string;
  createdAt?: Date;
  replies?: {
    _id: string;
    authorId: string;
    authorName?: string | null;
    content: string;
    createdAt?: Date;
  }[];
}

const ReplySchema = new Schema(
  {
    _id: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, default: null },
    content: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const CommentSchema = new Schema<ICommentDoc>({
  postId: { type: String, required: true, index: true },
  authorId: { type: String, required: true },
  authorName: { type: String, default: null },
  content: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  replies: { type: [ReplySchema], default: [] },
});

// Avoid overwrite in dev
const CommentModel = models.Comment || model<ICommentDoc>('Comment', CommentSchema);
export default CommentModel;
