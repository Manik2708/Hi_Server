import { Schema, model } from 'mongoose';
import { PostModel } from '../Models/post';

const postSchema = new Schema<PostModel>({
    createrName: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true, 
    },
    createdAt: {
        type: Date,
        required: true
    },
    post: {
        type: String,
        required: true
    },
})

const PostSchema = model("Post", postSchema)

export { PostSchema }
