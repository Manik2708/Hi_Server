import { afterAll, beforeAll, describe, it, expect, vi } from "vitest";
import { createMongoInstance, disconnect } from "../Helpers/db_instance";
import {
  closeTestServer,
  getTestServerInsatnce,
  ServerProperties,
} from "../Helpers/server_instance";
import mongoose from "mongoose";
import { createTestUser } from "../Helpers/create_test_user";
import { UserModel } from "../../Models/user";
import express from "express";
import jsonwt from "jwt-simple";
import request from "supertest";
import { changeEmail } from "../../APIs/change_email";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { User } from "../../Database/Models/user";

describe("Change Email API test", () => {
  let mongooseInstance: typeof mongoose;
  let serverInstance: ServerProperties;
  let user: UserModel;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    serverInstance = getTestServerInsatnce()!;
    serverInstance.app.use(changeEmail);
    user = await createTestUser();
    const token = (Math.random() + 1).toString(36).substring(2, 5);
    vi.spyOn(express.request, "header").mockReturnValue(token);
    vi.spyOn(jsonwt, "decode").mockImplementation((...args: any) => {
      return {
        id: user._id._id.toString(),
      };
    });
  });
  afterAll(async () => {
    mongooseInstance = await createMongoInstance();
    await disconnect(mongooseInstance);
    closeTestServer(serverInstance);
  });
  it("No password sent", async () => {
    const mockRequest = {
      email: "abc",
    };
    const response = await request(serverInstance.app)
      .post("/change-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Please enter email/password");
  });
  it("No email sent", async () => {
    const mockRequest = {
      password: "abc",
    };
    const response = await request(serverInstance.app)
      .post("/change-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Please enter email/password");
  });
  it("Invalid email sent", async () => {
    const mockRequest = {
      email: nanoid().toLowerCase(),
      password: "abc",
    };
    const response = await request(serverInstance.app)
      .post("/change-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Invalid email");
  });
  it("Wrong password sent", async () => {
    const mockRequest = {
      email: nanoid().toLowerCase() + "@xyz.com",
      password: "abc",
    };
    vi.spyOn(bcrypt, "compare").mockImplementationOnce(
      async (...args: any): Promise<boolean> => {
        return false;
      },
    );
    const response = await request(serverInstance.app)
      .post("/change-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Wrong Password");
  });
  it("Right password sent", async () => {
    const email = nanoid().toLowerCase() + "@xyz.com";
    const mockRequest = {
      email: email,
      password: "abc",
    };
    vi.spyOn(bcrypt, "compare").mockImplementationOnce(
      async (...args: any): Promise<boolean> => {
        return true;
      },
    );
    const response = await request(serverInstance.app)
      .post("/change-email")
      .send(mockRequest)
      .expect(200);
    const searchForUser = await User.findById(user._id);
    expect(response.body).toBe(true);
    expect(searchForUser?.email).toBe(email);
  });
});
