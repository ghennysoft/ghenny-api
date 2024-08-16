import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    author: {type:mongoose.Types.ObjectId, ref: 'users'},
    content: String,
    images: {
        type: Array,
        default: '',
    },
    likes: [{type:mongoose.Types.ObjectId, ref: 'users'}],
},
{
    timestamps: true
});

const PostModel = mongoose.model("Posts", postSchema)
export default PostModel
