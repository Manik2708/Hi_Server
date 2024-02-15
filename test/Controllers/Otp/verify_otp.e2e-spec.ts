import { afterAll, beforeAll, describe, it, expect, jest } from '@jest/globals';
import { createMongoInstance, disconnect } from '../../Helpers/db_instance';
import mongoose from 'mongoose';
import { createTestUser } from '../../Helpers/create_test_user';
import { UserModel } from '../../../src/Models/user';
import express from 'express';
import jsonwt from 'jwt-simple';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestMiddlewareModule } from '../../Helpers/test_middleware.module';
import { OTPModule } from '../../../src/Controllers/Otp/otp.module';
import { ControllerPaths } from '../../../src/Constants/contoller_paths';
import { OTPRoutes } from '../../../src/Constants/route_paths';
import { verifyOtpObject } from '../../../src/Controllers/Otp/Services/otp_services';
describe('Verify OTP API test', () => {
  let mongooseInstance: typeof mongoose;
  let user: UserModel;
  let app: INestApplication;
  const routeName =
    '/' + ControllerPaths.OTP_CONTROLLER + '/' + OTPRoutes.VERIFY_OTP;
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    user = await createTestUser();
    const token = (Math.random() + 1).toString(36).substring(2, 5);
    jest.spyOn(express.request, 'header').mockReturnValue(token);
    jest.spyOn(jsonwt, 'decode').mockImplementation((...args: any) => {
      return {
        id: user._id._id.toString(),
      };
    });
    const moduleRef = await Test.createTestingModule({
      imports: [OTPModule, TestMiddlewareModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await disconnect(mongooseInstance);
    await app.close();
  });
  it('No otp/token sent', async () => {
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send({})
      .expect(400);
    expect(response.body.message).toBe('OTP or token is not provided');
  });
  it('No otp sent', async () => {
    const mockRequest = {
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('OTP or token is not provided');
  });
  it('No token sent', async () => {
    const mockRequest = {
      otp: '1234',
    } as Express.Request;
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('OTP or token is not provided');
  });
  it('OTP sent is of wrong type', async () => {
    const mockRequest = {
      otp: 'abcd',
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Invalid OTP');
  });
  it('OTP is of wrong length', async () => {
    const mockRequest = {
      otp: 'abcde',
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Invalid OTP');
  });
  it('Wrong OTP is sent', async () => {
    const mockRequest = {
      otp: '1234',
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;

    jest.spyOn(verifyOtpObject, 'verifyOTP').mockReturnValueOnce(false);
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Verification failed');
  });
  it('Right OTP is sent', async () => {
    const mockRequest = {
      otp: '1234',
      otptoken: (Math.random() + 1).toString(36).substring(2, 5),
    } as Express.Request;

    jest.spyOn(verifyOtpObject, 'verifyOTP').mockReturnValueOnce(true);
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(200);
    expect(response.body._id).toBe(user._id._id.toString());
    expect(response.body.isEmailVerified).toBe(true);
  });
});
