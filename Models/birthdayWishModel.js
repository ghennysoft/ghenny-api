import mongoose from "mongoose";

const birthdayWishSchema = mongoose.Schema({
    user: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    posts: [{
        author: {
            type:mongoose.Types.ObjectId, 
            ref: 'Profiles', 
            required: true,
        },
        video: {
            type: String,
            required: true,
        },
        created_at: {
            type: Date,
            default: Date.now(),
        },
    }],
},
{
    timestamps: true,
});

const birthdayWishModel = mongoose.model("birthdayWishes", birthdayWishSchema)
export default birthdayWishModel