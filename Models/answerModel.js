import mongoose from "mongoose";

const answerSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles',
        required: true,
    },
    content: {
        type:String,
        required: true,
    },
    // reply: mongoose.Types.ObjectId,
    likes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    dislikes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const AnswerModel = mongoose.model("Answer", answerSchema)
export default AnswerModel
