import { nanoid } from 'nanoid';
import { User } from '../../package/database/src/Schemas/user';
import { UserModel } from '../../package/database/src/Models/user';
import mongoose from 'mongoose';

export function createTestUser(): Promise<UserModel> {
  return User.create({
    _id: new mongoose.Types.ObjectId(),
    name: `name${nanoid().toLowerCase()}`,
    username: `username${nanoid().toLowerCase()}`,
    email: `email${nanoid().toLowerCase()}@example.com`,
    password: `password${nanoid().toLowerCase()}`,
    dob: new Date(),
    isEmailVerified: false,
    anonymousId: `id${nanoid().toLowerCase()}`,
    sentConfessions: [],
    recievedConfessions: [],
    chats: [],
  });
}
