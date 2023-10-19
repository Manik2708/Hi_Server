import { Socket } from "socket.io";
import * as EventNames from '../Constants/event_names';
import { User } from "../Database/Models/user";

export const searchUser=(socket: Socket)=>{
    try{
        socket.on(EventNames.searchUser, async(data: any)=>{
            const UserList=await User.find({_id: {$ne: data.id}, name: {$regex: data.query, $options: 'i'}, username:{$regex: data.query, $options: 'i'} }).select('username').select('name');
            socket.emit(EventNames.searchedUser, JSON.stringify(UserList));
         })
    }catch(e: any){
        console.log(e.toString())
    }
}