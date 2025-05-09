import mongoose from "mongoose";

const storySchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    type: {
        type: String,
        enum: ["image", "video"],
    },
    media: {
        type: Array,
        default: [],
    },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 86400,
    },
},
{
    timestamps: true
});

const StoryModel = mongoose.model("Stories", storySchema)
export default StoryModel