import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['question', 'discussion'], required: true },
    course: { type: String },
    tags: [{ type: String }],
    category: { type: String },
    etablissment: { type: String },
    // isSolved: { type: Boolean, default: false },
    // subjects: [{type:mongoose.Types.ObjectId, ref: 'Subjects'}],
    answers: [{type:mongoose.Types.ObjectId, ref: 'Answers'}],
    votes: {
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        voters: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profiles' },
            voteType: { type: String, enum: ['up', 'down'] }
        }]
    },
    viewers: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const QuestionModel = mongoose.model("Questions", questionSchema)
export default QuestionModel
