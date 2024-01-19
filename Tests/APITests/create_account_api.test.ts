import { afterAll, beforeAll, describe, it, expect, vi } from "vitest";
import { createMongoInstance, disconnect } from "../Helpers/db_instance";
import {
  closeTestServer,
  getTestServerInsatnce,
  ServerProperties,
} from "../Helpers/server_instance";
import mongoose from "mongoose";
import { createTestUser } from "../Helpers/create_test_user";
import { nanoid } from "nanoid";
import { createAccount } from "../../APIs/create_account";
import request from "supertest";
import bcrypt from "bcryptjs";
import jsonwt from "jwt-simple";

describe("API test for Creating New Account", () => {
  let mongooseInstance: typeof mongoose;
  let serverInstance: ServerProperties;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    serverInstance = await getTestServerInsatnce();
    serverInstance.app.use(createAccount);
  });
  afterAll(async () => {
    mongooseInstance = await createMongoInstance();
    await disconnect(mongooseInstance);
    closeTestServer(serverInstance);
  });
  it("If user with same email address try to create account", async () => {
    const user = await createTestUser();
    const mockRequest = {
      name: `name${nanoid().toLowerCase()}`,
      username: `username${nanoid().toLowerCase()}`,
      email: user.email,
      password: `password${nanoid().toLowerCase()}`,
      dob: new Date(),
      isEmailVerified: false,
    } as Express.Request;
    const response = await request(serverInstance.app)
      .post("/create-account-without-verification")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe(
      "User with same Email or Phone exists. Please Login!",
    );
  });
  it("Username is same", async () => {
    const user = await createTestUser();
    const mockRequest = {
      name: `name${nanoid().toLowerCase()}`,
      username: user.username,
      email: `email${nanoid().toLowerCase()}@example.com`,
      password: `password${nanoid().toLowerCase()}`,
      dob: new Date(),
      isEmailVerified: false,
    } as Express.Request;
    const response = await request(serverInstance.app)
      .post("/create-account-without-verification")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe(
      "Username not available, kindly pick a new one",
    );
  });
  it("User send correct request", async () => {
    const anonymousId = new mongoose.mongo.ObjectId();
    await vi.spyOn(mongoose.mongo, "ObjectId").mockImplementationOnce(() => {
      return anonymousId;
    });
    const mockRequest = {
      name: `name${nanoid().toLowerCase()}`,
      username: `username${nanoid().toLowerCase()}`,
      email: `email${nanoid().toLowerCase()}@example.com`,
      password: `password${nanoid().toLowerCase()}`,
      dob: new Date(),
      isEmailVerified: false,
    } as Express.Request;
    await vi.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
      return "hashed-password";
    });
    await vi
      .spyOn(jsonwt, "encode")
      .mockImplementationOnce((...args: any): string => {
        return "token";
      });
    const response = await request(serverInstance.app)
      .post("/create-account-without-verification")
      .send(mockRequest)
      .expect(200);
    expect(response.body.password).toBe("hashed-password");
    expect(response.body.token).toBe("token");
    expect(response.body.anonymousId).toBe(anonymousId._id.toString());
  });
});
