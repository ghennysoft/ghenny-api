import mongoose from "mongoose";

const subjectSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
},
{
    timestamps: true
});

const SubjectModel = mongoose.model("Subjects", subjectSchema)
export default SubjectModel
