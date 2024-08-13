import mongoose, { Schema, model } from 'mongoose';
import { UserModel } from '../Models/user';
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
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  subscribedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  createdPosts : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: []
    }
  ],
  recievedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: []
    }
  ]
});
userSchema.index({ name: 'text', username: 'text' });
const User = model('User', userSchema);
export { User };
