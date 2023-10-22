import express from 'express';
import jwt from 'jwt-simple';
import { User } from '../Database/Models/user';
const authMiddlewre=async(req: express.Request, res: express.Response, next: express.NextFunction)=>{
 try{
    const token: any=req.header('token');
   //  if(token==null||undefined||token.toString().trim().length==0){
   //    return res.status(400).json({"msg": "Token not found"});
   //  }
   console.log('token is '+token)
    if(token.toString().includes(' ')){
      return res.status(400).json({"msg": "Invalid Token"});
    }
    const decode=jwt.decode(token, 'token');
    const user=await User.findById(decode.id);
    if(!user){
        return res.status(400).json({"msg": "User not found"});
    }
    res.locals.id=user.id;
    res.locals.token=token;
    next();
 } catch(e: any){
    return res.status(500).json({"msg": e.message});
 }
}
export {authMiddlewre};