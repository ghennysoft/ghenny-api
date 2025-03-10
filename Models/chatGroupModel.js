import mongoose from "mongoose";

const chatGroupSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    detail: String,
    picture: {
        key: {
            type: String,
        },
        location: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    members: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    admins: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    createdBy: {type:mongoose.Types.ObjectId, ref: 'Profiles'},
    messages: [{type:mongoose.Types.ObjectId, ref: 'Messages'}],
    latestMessage: {type:mongoose.Types.ObjectId, ref: 'Messages'},
},
{
    timestamps: true
});

const ChatGroupModel = mongoose.model("ChatGroup", chatGroupSchema)
export default ChatGroupModel