import mongoose from "mongoose";

const wishSchema = mongoose.Schema({
    user: {
        type:mongoose.Types.ObjectId, 
        ref: 'Users', 
        required: true,
    },
    postBg: [{
        author: {
            type:mongoose.Types.ObjectId, 
            ref: 'Users', 
            required: true,
        },
        video: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now(),
        },
    }],
},
{
    timestamps: true,
});

const WishModel = mongoose.model("Wishes", wishSchema)
export default WishModel