import { Schema, model } from "mongoose";
import { UserModel } from "../../Models/user";
import { chatModelSchema } from "./chat";
const userSchema = new Schema<UserModel>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    required: true,
  },
  anonymousId: {
    type: String,
    required: true,
  },
  chats: [
    {
      chats: chatModelSchema,
    },
  ],
});
userSchema.index({ name: "text", username: "text" });
const User = model("User", userSchema);
export { User };
