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
    posts: {
        type:mongoose.Types.ObjectId, 
        ref: 'birthdayPostWishes',
    },
},
{
    timestamps: true,
});

const birthdayWishModel = mongoose.model("birthdayWishes", birthdayWishSchema)
export default birthdayWishModel