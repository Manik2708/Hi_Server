import { afterAll, beforeAll, describe, it, expect, jest } from '@jest/globals';
import { createMongoInstance, disconnect } from '../Helpers/db_instance';
import mongoose from 'mongoose';
import { createTestUser } from '../Helpers/create_test_user';
import request from 'supertest';
import jsonwt from 'jwt-simple';
import { UserModel } from '../../src/Models/user';
import express from 'express';
import { Controller, Get, INestApplication, Req, Res } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestMiddlewareModule } from '../Helpers/test_middleware.module';
describe('Auth middleware test', () => {
  let mongooseInstance: typeof mongoose;
  let user: UserModel;
  let app: INestApplication;
  const routeName = '/test/';
  beforeAll(async () => {
    mongooseInstance = await createMongoInstance();
    const moduleRef = await Test.createTestingModule({
      imports: [TestMiddlewareModule],
      controllers: [TestController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    user = await createTestUser();
  });
  afterAll(async () => {
    await disconnect(mongooseInstance);
    await app.close();
  });
  it('No token provided', async () => {
    const response = await request(app.getHttpServer())
      .get(routeName)
      .send({})
      .expect(401);
    expect(response.body.message).toBe('Token not found');
  });
  it('Undefined token provided', async () => {
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      token: undefined,
    };
    const token = undefined;
    jest.spyOn(express.request, 'header').mockReturnValueOnce(token);
    const response = await request(app.getHttpServer())
      .get(routeName)
      .expect(401);
    expect(response.body.message).toBe('Token not found');
  });
  it('Token contains space', async () => {
    const token = (Math.random() + 1).toString(36).substring(2, 5).concat(' ');
    jest.spyOn(express.request, 'header').mockReturnValueOnce(token);
    const response = await request(app.getHttpServer())
      .get(routeName)
      .expect(401);
    expect(response.body.message).toBe('Invalid Token');
  });
  it('Invalid token provided', async () => {
    const token = (Math.random() + 1).toString(36).substring(2, 5);
    jest.spyOn(express.request, 'header').mockReturnValueOnce(token);
    const response = await request(app.getHttpServer())
      .get(routeName)
      .expect(500);
    expect(response.body.message).toBe(
      'Error: Not enough or too many segments',
    );
  });
  it('Valid token provided but no user found', async () => {
    const token = (Math.random() + 1).toString(36).substring(2, 5);
    jest.spyOn(express.request, 'header').mockReturnValueOnce(token);
    jest.spyOn(jsonwt, 'decode').mockImplementationOnce((...args: any) => {
      return {
        id: new mongoose.mongo.ObjectId(),
      };
    });
    const response = await request(app.getHttpServer())
      .get(routeName)
      .expect(400);
    expect(response.body.message).toBe(`User with this token doesn't exist`);
  });
  it('Valid token provided', async () => {
    const token = (Math.random() + 1).toString(36).substring(2, 5);
    jest.spyOn(express.request, 'header').mockReturnValueOnce(token);
    jest.spyOn(jsonwt, 'decode').mockImplementationOnce((...args: any) => {
      return {
        id: user._id._id.toString(),
      };
    });
    const response = await request(app.getHttpServer())
      .get(routeName)
      .expect(200);
    expect(response.body.id).toBe(user._id._id.toString());
    expect(response.body.token).toBe(token);
  });
});

@Controller('test')
class TestController {
  @Get('/')
  async createCustomGetRequest(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      return res.status(200).json({
        id: req.id,
        token: res.locals.token,
      });
    } catch (e: any) {
      return res.status(500).json({ msg: e.message });
    }
  }
}
