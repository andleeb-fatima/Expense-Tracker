import { Schema, Document, model } from "mongoose";
export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
}
const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, require: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<UserDocument>("User", UserSchema);
