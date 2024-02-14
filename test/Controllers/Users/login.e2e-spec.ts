import { afterAll, beforeAll, describe, it, expect, jest } from "@jest/globals";
import { createMongoInstance, disconnect } from "../../Helpers/db_instance";
import mongoose from "mongoose";
import { createTestUser } from "../../Helpers/create_test_user";
import { nanoid } from "nanoid";
import jsonwt from "jwt-simple";
import request from "supertest";
import { UserModel } from "../../../src/Models/user";
import bcrypt from "bcryptjs";
import { INestApplication } from "@nestjs/common";
import { ControllerPaths } from "../../../src/Constants/contoller_paths";
import { UserRoutes } from "../../../src/Constants/route_paths";
import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/Controllers/Users/user.module";
describe("API test for login API", () => {
  let mongooseInstance: typeof mongoose;
  let user: UserModel;
  let app: INestApplication;
  const routeName='/'+ControllerPaths.USER_CONTROLLER+'/'+UserRoutes.LOGIN;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    user = await createTestUser();
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
  it("Empty request", async () => {
    await request(app.getHttpServer()).post(routeName).send({}).expect(400);
  });
  it("Empty identify paramteter", async () => {
    const mockRequest = {
      password: `password${nanoid().toLowerCase()}`,
    } as Express.Request;
    await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
  });
  it("Empty password paramteter", async () => {
    const mockRequest = {
      identify: `email1${nanoid().toLowerCase()}@example.com`,
    } as Express.Request;
    await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
  });
  it("Not registered user", async () => {
    const mockRequest = {
      identify: `email1${nanoid().toLowerCase()}@example.com`,
      password: `password${nanoid().toLowerCase()}`,
    } as Express.Request;
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe(
      "No user exists with this username or email address",
    );
  });
  it("Wrong password response", async () => {
    const mockRequest = {
      identify: user.email,
      password: `password1${nanoid().toLowerCase()}`,
    } as Express.Request;
    await jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce(async (): Promise<boolean> => {
        return false;
      });
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe("Wrong password, Try again!");
  });
  it("User enters correct details", async () => {
    const mockRequest = {
      identify: user.email,
      password: user.password,
    } as Express.Request;
    await jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce(async (): Promise<boolean> => {
        return true;
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
    expect(response.body.token).toBe("token");
    expect(response.body.password).toBe(user.password);
    expect(response.body.name).toBe(user.name);
    expect(response.body._id).toBe(user._id._id.toString());
    expect(response.body.isEmailVerified).toBe(user.isEmailVerified);
    expect(response.body.email).toBe(user.email);
    expect(response.body.dob).toBe(user.dob.toISOString());
  });
});