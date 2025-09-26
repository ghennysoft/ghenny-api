import Conversation from '../Models/Conversation.js';
import Message from '../Models/Message.js';

// Récupérer toutes les conversations de l'utilisateur
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: {$in: req?.user?._id}
    })
    .populate('lastMessage')
    .populate({
      path: 'participants', 
      select: 'userId profilePicture online lastSeen',
      populate: {
        path: 'userId',
        select: 'firstname lastname username online lastSeen',
      }
    })
    .sort({ updatedAt: -1 })
    .exec();

    res.status(200).json(conversations);
  } catch (error) {
    console.log({ERROR: error})
    res.status(500).json({ error: error.message });
  }
};

// Créer une nouvelle conversation
export const createConversation = async (req, res) => {
  try {
    const { participants, type, groupName } = req.body;
    
    // S'assurer que l'utilisateur actuel est inclus dans les participants
    // const allParticipants = [...new Set([...participants, req.user._id])];
    
    // Pour les conversations privées, vérifier si une conversation existe déjà
    if (type === 'private' && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'private',
        participants: { $all: participants, $size: 2 }
      });
      
      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }
    }
    
    const conversation = new Conversation({
      type,
      participants: participants,
      ...(type === 'group' && { groupName, groupAdmin: req.user._id })
    });
    
    await conversation.save();
    await conversation.populate({
      path: 'participants', 
      select: 'userId username profilePicture online lastSeen',
      populate: {
        path: 'userId',
        select: 'firstname lastname profilePicture',
      }
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une conversation (seulement pour les groupes)
export const updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { groupName, participants } = req.body;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Vérifier les permissions (seul l'admin peut modifier un groupe)
    if (conversation.type === 'group' && conversation.groupAdmin?.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Only group admin can update the conversation' });
    }
    
    if (groupName) conversation.groupName = groupName;
    if (participants) conversation.participants = participants;
    
    await conversation.save();
    await conversation.populate('participants', 'username profilePicture online lastSeen');
    
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une conversation
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Vérifier que l'utilisateur est participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this conversation' });
    }
    
    // Supprimer tous les messages de la conversation
    await Message.deleteMany({ conversation: conversationId });
    
    // Supprimer la conversation
    await Conversation.findByIdAndDelete(conversationId);
    
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};