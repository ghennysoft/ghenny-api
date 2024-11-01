import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    content: String,
    subjects: [{type:mongoose.Types.ObjectId, ref: 'Subjects'}],
    answers: [{type:mongoose.Types.ObjectId, ref: 'Answers'}],
    likes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    dislikes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const QuestionModel = mongoose.model("Questions", questionSchema)
export default QuestionModel
