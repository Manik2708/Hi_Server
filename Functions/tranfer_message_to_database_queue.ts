import { MessageHandler } from "../Models/message_handler";
import amqp from 'amqplib/callback_api'
// This function is created so as to push message which can be any message, like Chat Message, Update Status of Confession, temporiarly to another Queue

// This is done because everyime when user requests to Send Chat Message, and any other event it is not viable to contact to Mongo Db, hence during low 

// traffic times, these messages and updations can be sent to MongoDb

export const transferMessageToDbQueue=(message: MessageHandler, userId:string, rabbitMQCallback:(callback:(chnl:amqp.Channel)=>void)=>void)=>{
    try{
        
    }catch(e:any){
        console.log(e.toString());
    }
}