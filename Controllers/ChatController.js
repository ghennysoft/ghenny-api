import ChatModel from "../Models/chatModel.js";
import MessageModel from "../Models/messageModel.js";

export const sendMessage = async (req, res) => {
    const {message, senderId} = req.body;
    const {receiverId} = req.params;
    try {
        let chat = await ChatModel.findOne({members: {$all: [senderId, receiverId]}});
        if(!chat){
            chat = await ChatModel.create({members: [senderId, receiverId]});
        }
        const newMessage = new MessageModel({senderId, content: message, chatId: chat._id});
        if(newMessage){
            chat.messages.push(newMessage._id);
            chat.latestMessage = newMessage._id;
        }
        await Promise.all([chat.save(), newMessage.save()]);
        res.status(201).json({chat, newMessage})
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getUserChats = async (req, res) => {
    const {currentUser} = req.params;
    try {
        const userChats = await ChatModel.find({members: {$in: currentUser}}).sort('-updatedAt')
        .populate({
            path: 'members',
            select: 'userId profilePicture',
            populate: {
                path: 'userId',
                select: 'firstname lastname',
            }
        })
        .populate('messages', 'senderId content createdAt updatedAt')
        .populate({
            path: 'latestMessage',
            select: 'senderId content createdAt updatedAt',
            populate: {
                path: 'senderId',
                select: 'userId profilePicture',
                populate: {
                    path: 'userId',
                    select: 'firstname lastname',
                }
            }
        })
        res.status(200).json(userChats)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSingleChat = async (req, res) => {
    const {firstId, secondId} = req.params;
    try {
        const findChat = await ChatModel.findOne({members: {$all: [firstId, secondId]}});
        const messages = await MessageModel.find({chatId: findChat._id});
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
}