import { nanoid } from "nanoid";
import { User } from "../../src/Database/Models/user";
import { UserModel } from "../../src/Models/user";

export function createTestUser(): Promise<UserModel> {
  return User.create({
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