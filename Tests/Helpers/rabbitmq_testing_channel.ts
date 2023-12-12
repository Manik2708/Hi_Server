import amqp from 'amqplib/callback_api'

export const createTestingChannel=(callback: (chnl: amqp.Channel)=>void)=>{
    amqp.connect('amqp://rabbit-testing:5672', async function(error: any, connection: amqp.Connection){
        if(error){
            console.log(error);
        }   
        try{
        connection.createChannel((err, channel)=>{
            callback(channel);
        })
       }
       catch(e: any){
        console.log(e.toString());
       }

    })
}