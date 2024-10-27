import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles',
        required: true,
    },
    content: {
        type:String,
        required: true,
    },
    reply: mongoose.Types.ObjectId,
    likes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const CommentModel = mongoose.model("Comments", commentSchema)
export default CommentModel