import mongoose from "mongoose";

const chatGroupSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    details: {
        type:String,
    },
    picture: {
        publicId: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    members: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    admins: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    createdBy: {type:mongoose.Types.ObjectId, ref: 'Profiles'},
    latestMessage: {type:mongoose.Types.ObjectId, ref: 'Messages'},
},
{
    timestamps: true
});

const ChatGroupModel = mongoose.model("ChatsGroup", chatGroupSchema)
export default ChatGroupModel