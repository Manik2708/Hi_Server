export interface CommentModel {
    id: string
    postId: string
    createdBy : string
    createrName: string
    comment: string
    createdAt: Date
    numberOfReplies: number
    replies?: ReplyModel[]
}

export interface ReplyModel {
    id: string
    commentId: string
    createdBy : string
    createrName: string
    reply: string
    createdAt: Date
}