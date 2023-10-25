import { afterAll, beforeAll, describe, it, expect, vi } from "vitest";
import { createMongoInstance , disconnect} from "../Helpers/db_instance";
import { closeTestServer, getTestServerInsatnce, ServerProperties } from "../Helpers/server_instance";
import mongoose from "mongoose";
import { createTestUser } from "../Helpers/create_test_user";
import { nanoid } from "nanoid";
import jsonwt from 'jwt-simple';
import { login } from "../../APIs/login";
import request from 'supertest'
import { UserModel } from "../../Models/user";
import bcrypt from 'bcryptjs';
describe('API test for login API', ()=>{
    let mongooseInstance: typeof mongoose;
    let serverInstance: ServerProperties;
    let user:UserModel
    beforeAll(async()=>{
        mongooseInstance=await createMongoInstance();
        serverInstance=getTestServerInsatnce()!;
        serverInstance.app.use(login);
        user=await createTestUser()
    })
    afterAll(async()=>{
        mongooseInstance=await createMongoInstance();
        await disconnect(mongooseInstance)
        closeTestServer(serverInstance)
    })
    it('Empty request',async () => {
        await request(serverInstance.app).post('/login').send({}).expect(400)
    })
    it('Empty identify paramteter',async () => {
        const mockRequest={
            password: `password${nanoid().toLowerCase()}`
        }as Express.Request
        await request(serverInstance.app).post('/login').send(mockRequest).expect(400)
    })
    it('Empty password paramteter',async () => {
        const mockRequest={
            identify:`email1${nanoid().toLowerCase()}@example.com`,
        }as Express.Request
        await request(serverInstance.app).post('/login').send(mockRequest).expect(400)
    })
    it('Not registered user', async()=>{
        const mockRequest={
            identify:`email1${nanoid().toLowerCase()}@example.com`,
            password: `password${nanoid().toLowerCase()}`
        }as Express.Request
        const response=await request(serverInstance.app).post('/login').send(mockRequest).expect(400)
        expect(response.body.msg).toBe('No user exists with this username or email address')
    })
    it('Wrong password response', async()=>{
        const mockRequest={
            identify:user.email,
            password: `password1${nanoid().toLowerCase()}`
        }as Express.Request
        await vi.spyOn(bcrypt, 'compare').mockImplementationOnce(async():Promise<boolean>=>{
            return false;
        })
        const response=await request(serverInstance.app).post('/login').send(mockRequest).expect(400)
        expect(response.body.msg).toBe('Wrong password, Try again!')
    })
    it('User enters correct details', async()=>{
        const mockRequest={
            identify:user.email,
            password: user.password
        }as Express.Request
        await vi.spyOn(bcrypt, 'compare').mockImplementationOnce(async():Promise<boolean>=>{
            return true;
        })
        await vi.spyOn(jsonwt, 'encode').mockImplementationOnce((...args:any):string=>{
            return 'token';
        })
        const response=await request(serverInstance.app).post('/login').send(mockRequest).expect(200)
        expect(response.body.token).toBe('token')
        expect(response.body.password).toBe(user.password)
        expect(response.body.name).toBe(user.name)
        expect(response.body._id).toBe(user._id._id.toString())
        expect(response.body.isEmailVerified).toBe(user.isEmailVerified)
        expect(response.body.email).toBe(user.email)
        expect(response.body.dob).toBe(user.dob.toISOString())
    })
})