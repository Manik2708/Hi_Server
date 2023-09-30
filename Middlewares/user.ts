import express from 'express';
import jwt from 'jwt-simple';
import { User } from '../Database/Models/user';
const authMiddlewre=async(req: express.Request, res: express.Response, next: express.NextFunction)=>{
 try{
    const token: any=req.header('token');
    const decode=jwt.decode(token, 'token');
    const user=await User.findById(decode.id);
    if(!user){
        return res.status(400).json({"msg": "User not found"});
    }
    res.locals.id=user.id;
    res.locals.token=token;
    next();
 }catch(e: any){
    res.status(500).json({"msg": e.message});
 }
}
export {authMiddlewre};