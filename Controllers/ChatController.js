import ChatGroupModel from "../Models/chatGroupModel.js";
import ChatModel from "../Models/chatModel.js";
import MessageModel from "../Models/messageModel.js";
import UserModel from "../Models/userModel.js";

export const sendMessage = async (req, res) => {
    const {content, senderId} = req.body;
    const {receiverId} = req.params;
    try {
        let chat = await ChatModel.findOne({members: {$all: [senderId, receiverId]}});
        if(!chat){
            chat = await ChatModel.create({members: [senderId, receiverId]});
        }
        const newMessage = new MessageModel({senderId, content, chatId: chat._id});
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

// Marquer comme vu
// router.post("/:messageId/seen", authMiddleware, async (req, res) => {
//     try {
//       const message = await Message.findById(req.params.messageId);
  
//       if (!message.seenBy.includes(req.user.id)) {
//         message.seenBy.push(req.user.id);
//         await message.save();
//       }
  
//       res.json({ message: "Message vu" });
//     } catch (error) {
//       res.status(500).json({ message: "Erreur serveur" });
//     }
//   });
  
  // Marquer comme lu
//   router.post("/:messageId/read", authMiddleware, async (req, res) => {
//     try {
//       const message = await Message.findById(req.params.messageId);
  
//       if (!message.readBy.includes(req.user.id)) {
//         message.readBy.push(req.user.id);
//         await message.save();
//       }
  
//       res.json({ message: "Message lu" });
//     } catch (error) {
//       res.status(500).json({ message: "Erreur serveur" });
//     }
//   });

export const getUserChats = async (req, res) => {
    const {currentUser} = req.params;
    try {
        const userChats = await ChatModel.find({members: {$in: currentUser}}).sort('-updatedAt')
        .populate({
            path: 'members',
            select: 'userId profilePicture',
            populate: {
                path: 'userId',
                select: 'firstname lastname username',
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
                    select: 'firstname lastname username',
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

export const getUsers = async (req, res) => {
    try {
        const profiles = await UserModel.find({
            $or: [
                {firstname: {$regex: req.query.q, $options: 'i'}},
                {lastname: {$regex: req.query.q, $options: 'i'}},
            ],
        })
        .select('username firstname lastname')
        .populate('profileId', 'profilePicture')
        res.status(200).json(profiles)
    } catch (error) {
        res.status(500).json(error)
    }
}

// Group controllers
export const createGroup = async (req, res) => {
    const {name, detail, author} = req.body;
    try {
        const newGroup = new ChatGroupModel({
            name, 
            detail, 
            members: [author], 
            admins: [author], 
            createdBy: author,
        });
        await newGroup.save();
        res.status(201).json(newGroup)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getGroups = async (req, res) => {
    const {userId} = req.params;
    try {
        const groups = await ChatGroupModel.find({members: {$in: userId}}).sort('-updatedAt')
        .populate({
            path: 'members',
            select: 'userId profilePicture',
            populate: {
                path: 'userId',
                select: 'firstname lastname',
            }
        })
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
        res.status(200).json(groups)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addMembers = async (req, res) => {
    const {membersArray, groupId} = req.body;
    try {
        const group = await ChatGroupModel.findById(groupId)
        for (let i=0; i<membersArray.length; i++) {
            const checkExistingMember = await group.members.includes(membersArray[i]);
            if(!checkExistingMember) {
                await group.updateOne({$push: {members: membersArray[i]}});
                console.log('added');
            } else {
                console.log('existing');
            }
        }
        await group.save();
        res.status(201).json(group)
    } catch (error) {
        res.status(500).json(error)
    }
}

// router.post("/:groupId/remove", authMiddleware, async (req, res) => {
//     try {
//       const { userId } = req.body;
//       const group = await Group.findById(req.params.groupId);
  
//       if (!group.admins.includes(req.user.id)) return res.status(403).json({ message: "Accès refusé" });
  
//       group.members = group.members.filter(id => id.toString() !== userId);
//       group.admins = group.admins.filter(id => id.toString() !== userId);
//       await group.save();
  
//       res.json({ message: "Membre supprimé" });
//     } catch (error) {
//       res.status(500).json({ message: "Erreur serveur" });
//     }
//   });

// Nommer un administrateur
// router.post("/:groupId/make-admin", authMiddleware, async (req, res) => {
//     try {
//       const { userId } = req.body;
//       const group = await Group.findById(req.params.groupId);
  
//       if (!group.admins.includes(req.user.id)) return res.status(403).json({ message: "Accès refusé" });
  
//       if (!group.admins.includes(userId)) {
//         group.admins.push(userId);
//         await group.save();
//         res.json({ message: "Administrateur ajouté" });
//       } else {
//         res.status(400).json({ message: "Déjà administrateur" });
//       }
//     } catch (error) {
//       res.status(500).json({ message: "Erreur serveur" });
//     }
//   });