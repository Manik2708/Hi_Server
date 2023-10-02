import mongoose, {Schema, model} from 'mongoose';

import { ConfessionModel } from '../../Models/confession';

export const confessionSchema=new Schema<ConfessionModel>(
    {
      SenderId:{
        required: true,
        type: String
      }, 
      SenderAnonymousId:{
        required: true,
        type: String
      },
       CrushId:{
        required: true,
        type: String
       },
       Confession:{
        required: true,
        type: String
       },
       Time: {
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