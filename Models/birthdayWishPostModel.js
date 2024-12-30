import mongoose from "mongoose";

const birthdayWishPostSchema = mongoose.Schema({
    birthdayId: {
        type:mongoose.Types.ObjectId, 
        ref: 'birthdayWishes', 
        required: true,
    },
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    video: {
        type: String,
        required: true,
    },
},
{
    timestamps: true,
});

const birthdayWishPostModel = mongoose.model("birthdayPostWishes", birthdayWishPostSchema)
export default birthdayWishPostModel