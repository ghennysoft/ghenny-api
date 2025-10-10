import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles',
        required: true,
    },
    postId: {
        type:mongoose.Types.ObjectId, 
        ref: 'Posts',
        required: true,
    },
    content: {
        type:String,
        required: true,
    },
    reply: mongoose.Types.ObjectId,
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profiles'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
},
{
    timestamps: true
});

const CommentModel = mongoose.model("Comments", commentSchema)
export default CommentModel