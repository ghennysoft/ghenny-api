import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
    author: {
        type:mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    subjects: [{
        type:mongoose.Types.ObjectId, 
        ref: 'Subjects', 
        // required: true,
    }],
    content: String,
    // answers: [{type:mongoose.Types.ObjectId, ref: 'Comments'}],
    // likes: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
},
{
    timestamps: true
});

const QuestionModel = mongoose.model("Questions", questionSchema)
export default QuestionModel
