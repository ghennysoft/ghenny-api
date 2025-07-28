import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    author:{
        type: mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    content: String,
    media: {
        type: Array,
        default: [],
    },
    postBg: {
        img: {
            type: String
        },
        color: {
            type: String
        },
    },
    likes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    comments: [{type:mongoose.Types.ObjectId, ref: 'Comments'}],
},
{
    timestamps: true
});

const PostModel = mongoose.model("Posts", postSchema)
export default PostModel
