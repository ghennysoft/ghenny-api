import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    chatId: {type:mongoose.Types.ObjectId, ref: 'Chats'},
    chatGroupId: {type:mongoose.Types.ObjectId, ref: 'ChatGroup'},
    senderId: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true,},
    content: { type:String },
    media: {
        type: Array,
        default: [],
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
},
{
    timestamps: true
});

const MessageModel = mongoose.model("Messages", messageSchema)
export default MessageModel