import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    members: [{type:mongoose.Types.ObjectId, ref: 'Profiles'}],
    messages: [{type:mongoose.Types.ObjectId, ref: 'Messages'}],
    latestMessage: {type:mongoose.Types.ObjectId, ref: 'Messages'},
},
{
    timestamps: true
});

const ChatModel = mongoose.model("Chats", chatSchema)
export default ChatModel