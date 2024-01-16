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
import { verifyOTP, verifyOtpObject } from "../../APIs/verify_otp";
import express from "express";
import jsonwt from "jwt-simple";
import request from "supertest";
describe("Verify OTP API test", () => {
  let mongooseInstance: typeof mongoose;
  let serverInstance: ServerProperties;
  let user: UserModel;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    serverInstance = getTestServerInsatnce()!;
    serverInstance.app.use(verifyOTP);
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
  it("No otp/token sent", async () => {
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send({})
      .expect(400);
    expect(response.body.msg).toBe("OTP or token is not provided");
  });
  it("No otp sent", async () => {
    const mockRequest = {
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("OTP or token is not provided");
  });
  it("No token sent", async () => {
    const mockRequest = {
      otp: "1234",
    } as Express.Request;
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("OTP or token is not provided");
  });
  it("OTP sent is of wrong type", async () => {
    const mockRequest = {
      otp: "abcd",
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Invalid OTP");
  });
  it("OTP is of wrong length", async () => {
    const mockRequest = {
      otp: "abcde",
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Invalid OTP");
  });
  it("Wrong OTP is sent", async () => {
    const mockRequest = {
      otp: "1234",
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;

    vi.spyOn(verifyOtpObject, "verifyOTP").mockReturnValueOnce(false);
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send(mockRequest)
      .expect(400);
    expect(response.body.msg).toBe("Verification failed");
  });
  it("Right OTP is sent", async () => {
    const mockRequest = {
      otp: "1234",
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;

    vi.spyOn(verifyOtpObject, "verifyOTP").mockReturnValueOnce(true);
    const response = await request(serverInstance.app)
      .post("/verify-email")
      .send(mockRequest)
      .expect(200);
    expect(response.body._id).toBe(user._id._id.toString());
    expect(response.body.isEmailVerified).toBe(true);
  });
});
