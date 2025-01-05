import mongoose from "mongoose";

const pinCategorySchema = mongoose.Schema({
    author: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true},
    name: {type:String, required: true},
    color: {type:String, required: true},
    pins: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const PinCategoryModel = mongoose.model("PinCategory", pinCategorySchema)
export default PinCategoryModel