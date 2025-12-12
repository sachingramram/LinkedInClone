import mongoose, { Schema, model, models } from 'mongoose';

export interface IProfile {
  userId: string;
  headline?: string;
  location?: string;
  bio?: string;
  updatedAt?: Date;
}

const ProfileSchema = new Schema<IProfile>({
  userId: { type: String, required: true, unique: true },
  headline: { type: String },
  location: { type: String },
  bio: { type: String },
  updatedAt: { type: Date, default: () => new Date() },
});

export default models.Profile || model<IProfile>('Profile', ProfileSchema);
