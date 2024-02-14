import { Test } from "@nestjs/testing" 
import { createMongoInstance, disconnect } from "../../Helpers/db_instance";
import mongoose from "mongoose";
import { createTestUser } from "../../Helpers/create_test_user";
import { nanoid } from "nanoid";
import request from "supertest";
import bcrypt from "bcryptjs";
import jsonwt from "jwt-simple";
import { UserModule } from "../../../src/Controllers/Users/user.module";
import { INestApplication } from '@nestjs/common';
import { ControllerPaths } from "../../../src/Constants/contoller_paths";
import { UserRoutes } from "../../../src/Constants/route_paths";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals"

describe("API test for Creating New Account", () => {
  let mongooseInstance: typeof mongoose;
  let app: INestApplication;
  const routeName='/'+ControllerPaths.USER_CONTROLLER+'/'+UserRoutes.CREATE_ACCOUNT_WITHOUT_VERIFICATION;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    const moduleRef = await Test.createTestingModule({
        imports: [UserModule]
    }).compile();
    app= moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    mongooseInstance = await createMongoInstance();
    await disconnect(mongooseInstance);
    await app.close();
    
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
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe(
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
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe(
      "Username not available, kindly pick a new one",
    );
  });
  it("User send correct request", async () => {
    const anonymousId = new mongoose.mongo.ObjectId();
    await jest.spyOn(mongoose.mongo, "ObjectId").mockImplementationOnce(() => {
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
    await jest.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
      return "hashed-password";
    });
    await jest
      .spyOn(jsonwt, "encode")
      .mockImplementationOnce((...args: any): string => {
        return "token";
      });
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(200);
    expect(response.body.password).toBe("hashed-password");
    expect(response.body.token).toBe("token");
    expect(response.body.anonymousId).toBe(anonymousId._id.toString());
  });
});