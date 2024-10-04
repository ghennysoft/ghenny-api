import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Users', 
        required: true,
    },
    post: {
        type:mongoose.Types.ObjectId, 
        ref: 'Posts', 
        required: true,
    },
    content: String,
    likes: [{type:mongoose.Types.ObjectId, ref: 'Users'}],
},
{
    timestamps: true
});

const CommentModel = mongoose.model("Comments", commentSchema)
export default CommentModel
