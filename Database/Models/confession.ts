import {Schema, model} from 'mongoose';

import { ConfessionModel } from '../../Models/confession';

export const confessionSchema=new Schema<ConfessionModel>(
    {
      senderId:{
        required: true,
        type: String
      }, 
      senderAnonymousId:{
        required: true,
        type: String
      },
       crushId:{
        required: true,
        type: String
       },
       confession:{
        required: true,
        type: String
       },
       time: {
        required: true,
        type: String
       },
       status:{
        required: true,
        type: String
       },
       crushName:{
        required: true,
        type: String
       }
    }
)
export const ConfessionDb=model('Confession', confessionSchema);