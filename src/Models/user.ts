import mongoose from 'mongoose';

export interface UserModel extends mongoose.Document {
  name: String;
  username: String;
  email: String;
  password: string;
  dob: Date;
  isEmailVerified: Boolean;
  anonymousId: String;
  _doc?: any;
}
