import { nanoid } from "nanoid";
import { User } from "../../Database/Models/user";
import { UserModel } from "../../Models/user";
import { vi } from "vitest";
import jsonwt from "jwt-simple";
import express from "express";
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

// Put this function in before statement to get token validation as true while writing unit tests for APIs

export async function createTestUserWithTokenValidation(): Promise<UserModel> {
  const user = await createTestUser();
  const token = (Math.random() + 1).toString(36).substring(2, 5);
  vi.spyOn(express.request, "header").mockReturnValueOnce(token);
  vi.spyOn(jsonwt, "decode").mockImplementationOnce((...args: any) => {
    return {
      id: user._id._id.toString(),
    };
  });
  return user;
}
