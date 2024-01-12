// import { Socket } from "socket.io";
// import * as EventNames from '../Constants/event_names';
// import { QueueNames } from "../Constants/queues_redis";
// import { MessageHandler } from "../Models/message_handler";
// import { confessionMessageType } from "../Constants/messasge_type";
// export const recieveAllMessages=(socket: Socket)=>{
        // socket.on(EventNames.recieveAllMessages, (userId)=>{
            // createChannel((recievingChannelForOfflineUser: amqp.Channel)=>{
            //     recievingChannelForOfflineUser.assertQueue(QueueNames.OfflineQueue+userId, {durable: true});
            //     recievingChannelForOfflineUser.consume(QueueNames.OfflineQueue+userId, (msg)=>{
            //         if(msg==null){
            //             return;
            //         }
            //         const recievedMessage: MessageHandler=JSON.parse(msg.content.toString()!);
            //         if(recievedMessage.messageType==confessionMessageType){
            //             socket.emit(EventNames.recieveConfession, recievedMessage);
            //             recievingChannelForOfflineUser.ack(msg);
            //         }
            //     },{
            //         noAck: false
            //     }
            //     )
            // })
        // })   
//}