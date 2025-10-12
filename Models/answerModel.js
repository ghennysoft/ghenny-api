import mongoose from "mongoose";

const answerSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles',
        required: true,
    },
    questionId: {
        type:mongoose.Types.ObjectId, 
        ref: 'Questions',
        required: true,
    },
    content: {
        type:String,
        required: true,
    },
    isAccepted: { type: Boolean, default: false },
    acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions' },
    // reply: mongoose.Types.ObjectId,
    votes: {
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        voters: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profiles' },
        voteType: { type: String, enum: ['up', 'down'] }
        }]
    },
},
{
    timestamps: true
});

const AnswerModel = mongoose.model("Answers", answerSchema)
export default AnswerModel