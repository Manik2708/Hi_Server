// import { afterAll, beforeAll, describe, it, expect, vi } from "vitest";
// import { createMongoInstance , disconnect} from "../Helpers/db_instance";
// import { closeTestServer, getTestServerInsatnce, ServerProperties } from "../Helpers/server_instance";
// import mongoose from "mongoose";
// import { createTestUser } from "../Helpers/create_test_user";
// import request from 'supertest'
// import jsonwt from 'jwt-simple';
// import { UserModel } from "../../Models/user";
// import express from 'express'
// import { authMiddlewre } from "../../Middlewares/user";
// describe('Auth middleware test', ()=>{
//     let mongooseInstance: typeof mongoose;
//     let serverInstance: ServerProperties;
//     let user:UserModel
//     let mockApi:express.Router;
//     beforeAll(async()=>{
//         mongooseInstance=await createMongoInstance();
//         serverInstance=getTestServerInsatnce();
//         mockApi=express.Router()
//         mockApi.get('/', authMiddlewre, (req, res)=>{
//             try{
//                 return res.status(200).json({
//                     id:res.locals.id,
//                     token:res.locals.token
//                 })
//             }catch(e:any){
//                 return res.status(500).json({'msg': e.message})
//             }
//         })
//         user=await createTestUser();
//         serverInstance.app.use(mockApi)
//     })
//     afterAll(async()=>{
//         mongooseInstance=await createMongoInstance();
//         await disconnect(mongooseInstance)
//         closeTestServer(serverInstance)
//     })
//     it('No token provided', async()=>{
//         const response=await request(serverInstance.app).get('/').send({}).expect(500)
//         console.log(response.body.msg)
//         // expect(response.body.msg).toBe("Token not found")
//     })
//     it('Undefined token provided', async()=>{
//         const mockRequest={
//             headers:{
//                 'Content-Type': 'application/json; charset=UTF-8',
//                 'token':undefined
//             }
//         }as Express.Request
//         const response=await request(serverInstance.app).get('/').send(mockRequest).expect(500)
//         console.log(response.body.msg)
//         // expect(response.body.msg).toBe("Token not found")
//     })
//     it('token contains space', async()=>{
//         const mockRequest={
//             headers:{
//                 token:(Math.random() + 1).toString(36).substring(2, 5).concat(" ")
//             }
//         }
//         const response=await request(serverInstance.app).get('/').send(mockRequest).expect(500)
//         console.log(response.body.msg)
//         // expect(response.body.msg).toBe("Token not found")
//     })
//     it('Invalid token provided', async()=>{
//         const mockRequest={
//             headers:{
//                 'Content-Type': 'application/json; charset=UTF-8',
//                 'token':(Math.random() + 1).toString(36).substring(2, 5)
//             }
//         }as Express.Request
//         const response=await request(serverInstance.app).get('/').send(mockRequest).expect(500)
//         console.log(response.body.msg)
//     })
// })