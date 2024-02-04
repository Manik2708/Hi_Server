import express from "express"
import { BadRequestError, BadRequestTypes } from "src/Errors/bad_request";
import { InternalServerError } from "src/Errors/server_error";
import { userOnline } from "src/Functions/set_user_online";
import { client } from "src/service_containers";

export class SetUserOnline{
    setUserOnline = async(req: express.Request, res: express.Response)=>{
        try {
            const userId = req.id;
            const socketId = req.header("socketId");
            if(userId==null){
                throw new BadRequestError(BadRequestTypes.USER_DOESNOT_EXISTS);
            }
            userOnline(userId, socketId!, client);
            return res.status(200);
          } catch (e: any) {
            throw new InternalServerError(e.toString());
          }
    }
}