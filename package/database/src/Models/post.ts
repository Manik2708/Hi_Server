import mongoose from "mongoose"

export interface PostModel extends mongoose.Document{
    _id: mongoose.Types.ObjectId
    createrName: string
    createdBy: string
    createdAt: Date
    post: string
    comments?: Comment[]
}