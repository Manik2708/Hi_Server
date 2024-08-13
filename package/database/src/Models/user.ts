import mongoose from 'mongoose';

export interface UserModel extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: String;
  username: String;
  email: String;
  password: string;
  dob: Date;
  isEmailVerified: Boolean;
  anonymousId: String;
  subscribers?: String[];
  subscribedUsers?: String[];
  createdPosts?: String[];
  recievedPosts?: String[];
  _doc?: any;
}
