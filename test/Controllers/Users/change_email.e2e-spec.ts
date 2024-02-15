import { afterAll, beforeAll, describe, it, expect, jest } from '@jest/globals';
import { createMongoInstance, disconnect } from '../../Helpers/db_instance';
import mongoose from 'mongoose';
import { createTestUser } from '../../Helpers/create_test_user';
import { UserModel } from '../../../src/Models/user';
import express from 'express';
import jsonwt from 'jwt-simple';
import request from 'supertest';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { User } from '../../../src/Database/Models/user';
import { INestApplication } from '@nestjs/common';
import { ControllerPaths } from '../../../src/Constants/contoller_paths';
import { UserRoutes } from '../../../src/Constants/route_paths';
import { UserModule } from '../../../src/Controllers/Users/user.module';
import { Test } from '@nestjs/testing';
import { TestMiddlewareModule } from '../../Helpers/test_middleware.module';

describe('Change Email API test', () => {
  let mongooseInstance: typeof mongoose;
  let user: UserModel;
  let app: INestApplication;
  const routeName =
    '/' + ControllerPaths.USER_CONTROLLER + '/' + UserRoutes.CHANGE_EMAIL;
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
      imports: [UserModule, TestMiddlewareModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });
  it('No password sent', async () => {
    const mockRequest = {
      email: 'abc',
    };
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Please Enter Password');
  });
  it('No email sent', async () => {
    const mockRequest = {
      password: 'abc',
    };
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Please Enter Email');
  });
  it('Invalid email sent', async () => {
    const mockRequest = {
      email: nanoid().toLowerCase(),
      password: 'abc',
    };
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Invalid email');
  });
  it('Wrong password sent', async () => {
    const mockRequest = {
      email: nanoid().toLowerCase() + '@xyz.com',
      password: 'abc',
    };
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementationOnce(async (): Promise<boolean> => {
        return false;
      });
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(400);
    expect(response.body.message).toBe('Wrong password, Try again!');
  });
  it('Right password sent', async () => {
    const email = nanoid().toLowerCase() + '@xyz.com';
    const mockRequest = {
      email: email,
      password: 'abc',
    };
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementationOnce(async (): Promise<boolean> => {
        return true;
      });
    const response = await request(app.getHttpServer())
      .post(routeName)
      .send(mockRequest)
      .expect(201);
    const searchForUser = await User.findById(user._id);
    expect(response.body).toBe(true);
    expect(searchForUser?.email).toBe(email);
  });
  afterAll(async () => {
    await disconnect(mongooseInstance);
    await app.close();
  });
});
