import mongoose from "mongoose";

const pinGroupSchema = mongoose.Schema({
    author: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true},
    name: {type:String, required: true},
    color: {type:String, required: true},
    pins: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const PinGroupModel = mongoose.model("PinGroup", pinGroupSchema)
export default PinGroupModel