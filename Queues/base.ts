// import amqp from 'amqplib/callback_api'
// import { IfRunningOnDocker } from '../enviornment_variables';

// const rabbitMqConnectionString=IfRunningOnDocker=='true'?'amqp://rabbit:5672':'amqp://rabbit'

// export const createChannel=(callback: (chnl: amqp.Channel)=>void)=>{
//     amqp.connect(rabbitMqConnectionString, async function(error: any, connection: amqp.Connection){
//         if(error){
//             console.log(error);
//         }   
//         try{
//         connection.createChannel((err, channel)=>{
//             callback(channel);
//         })
//        }
//        catch(e: any){
//         console.log(e.toString());
//        }

//     })
// }