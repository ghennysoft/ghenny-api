import mongoose from "mongoose";

const pointHistorySchema = mongoose.Schema({
    userId: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    action: {
        type:String,
        required: true,
    },
    points: {
        type:String,
        required: true,
    },
    target: {
        type:mongoose.Types.ObjectId,
        required: true,
    },
    targetType: { type: String, enum: ['question', 'answer'], required: true },
    newReputation: {
        type:String,
        required: true,
    },
},
{
    timestamps: true
});

const PointHistoryModel = mongoose.model("PointHistory", pointHistorySchema)
export default PointHistoryModel
