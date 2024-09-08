import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Users', 
        required: true,
    },
    content: String,
    images: {
        type: Array,
    },
    postBg: {
        img: {
            type: String
        },
        color: {
            type: String
        },
    },
    likes: [{type:mongoose.Types.ObjectId, ref: 'Users'}],
},
{
    timestamps: true
});

const PostModel = mongoose.model("Posts", postSchema)
export default PostModel
