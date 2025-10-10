import Message from '../Models/Message.js';
import Conversation from '../Models/Conversation.js';
// import { deleteFromS3 } from '../utils/s3.js';

// Envoyer un message
export const sendMessage = async (req, res) => {
  // console.log({DATA: req.body});
  try {

    const attachments = (req.files)?.map(file => file.key) || [];

    const message = new Message({
      conversation: req.body.conversationId,
      sender: req.user._id,
      content: req.body.content,
      // messageType: req.body.messageType,
      attachments,
      replyTo: req.body.replyTo
    });

    await message.save();
    
    // Mettre à jour la dernière message de la conversation
    await Conversation.findByIdAndUpdate(req.body.conversationId, { 
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Populer le message avec les données de l'expéditeur
    await message.populate('sender', 'username profilePicture lastSeen online');

    // Émettre l'événement socket.io
    // console.log({IO: req.app});
    const io = req.app.get('io');
    io?.to(req.body.conversationId)?.emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    console.log({ERROR: error});
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les messages d'une conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profilePicture lastSeen online')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Inverser l'ordre pour avoir les plus anciens en premier
    const reversedMessages = messages.reverse();

    res.status(200).json({
      messages: reversedMessages,
      hasMore: messages.length === limit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Modifier un message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Vérifier si l'utilisateur est l'auteur du message
    if (message.sender.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.edited = true;
    await message.save();

    // Émettre l'événement socket.io
    const io = req.app.get('io');
    io.to(message.conversation.toString()).emit('messageUpdated', message);

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un message
export const deleteMessage = async (req, res) => {
  // try {
  //   const { messageId } = req.params;

  //   const message = await Message.findById(messageId);

  //   if (!message) {
  //     return res.status(404).json({ error: 'Message not found' });
  //   }

  //   // Vérifier si l'utilisateur est l'auteur du message
  //   if (message.sender.toString() !== req.user._id) {
  //     return res.status(403).json({ error: 'Not authorized to delete this message' });
  //   }

  //   // Supprimer les fichiers associés de S3
  //   if (message.attachments && message.attachments.length > 0) {
  //     await Promise.all(message.attachments.map(key => deleteFromS3(key)));
  //   }

  //   await Message.findByIdAndDelete(messageId);

  //   // Émettre l'événement socket.io
  //   const io = req.app.get('io');
  //   io.to(message.conversation.toString()).emit('messageDeleted', messageId);

  //   res.status(200).json({ message: 'Message deleted successfully' });
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // }
};

// Marquer un message comme lu
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Vérifier si l'utilisateur est dans la conversation
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation?.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to mark this message as read' });
    }

    // Ajouter l'utilisateur à la liste des lecteurs s'il n'y est pas déjà
    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();

      // Émettre l'événement socket.io
      const io = req.app.get('io');
      io.to(message.conversation.toString()).emit('messageRead', {
        messageId: message._id,
        readerId: req.user._id
      });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};