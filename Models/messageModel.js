import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    chatId: {type:mongoose.Types.ObjectId, ref: 'Chats'},
    chatGroupId: {type:mongoose.Types.ObjectId, ref: 'ChatGroup'},
    senderId: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true,},
    content: {
        type:String,
        required: true,
    },
    media: {
        type: Array,
        default: [],
    },
},
{
    timestamps: true
});

const MessageModel = mongoose.model("Messages", messageSchema)
export default MessageModel