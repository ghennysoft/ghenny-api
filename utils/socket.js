import { Server } from 'socket.io';
import authSocket from './socketMiddleware.js';
import User from '../Models/userModel.js';
import Profile from '../Models/profileModel.js';
import Message from '../Models/Message.js';
import Conversation from '../Models/Conversation.js';

let typingUsers = new Map();
let onlineUsers = new Map();

export const setupSocket = (io) => {
  // Middleware d'authentification pour les sockets
  io.use(authSocket);

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.user?.userId?.username, 'Socket ID:', socket.id);

    // Marquer l'utilisateur comme en ligne
    try {
      const userState = await User.findByIdAndUpdate(socket.user.userId._id, {
        online: true,
        socketId: socket.id,
        lastSeen: new Date()
      });

      onlineUsers.set(socket.user._id, socket.id);
      
      // Notifier tous les clients que l'utilisateur est en ligne
      io.emit('userOnline', socket.user._id);
      console.log(`User ${socket.user.userId.firstname} is now online`);
    } catch (error) {
      console.error('Error setting user online:', error);
    }

    // Vérification sécurisée des conversations
    if (socket.user && Array.isArray(socket.user.conversations)) {
      socket.user.conversations.forEach((conversationId) => {
        socket.join(conversationId.toString());
        console.log(`User joined conversation: ${conversationId}`);
      });
    }

    // Rejoindre les conversations de l'utilisateur
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User manually joined conversation: ${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User left conversation: ${conversationId}`);
    });

    socket.on('typingStart', (data) => {
      if (!data.conversationId) {
        return;
      }
      typingUsers.set(socket.id, data.conversationId);
      socket.to(data.conversationId).emit('userTyping', {
        userId: socket.user?._id,
        username: socket.user?.userId?.username,
        conversationId: data.conversationId
      });
    });

    socket.on('typingStop', () => {
      const conversationId = typingUsers.get(socket.id);
      if (conversationId) {
        socket.to(conversationId).emit('userStopTyping', {
          userId: socket.user?._id,
          conversationId
        });
        typingUsers.delete(socket.id);
      }
    });

    socket.on('newMessage', async (data) => {
      try {
        console.log('New message received:', data);
        
        const { conversationId, content, messageType, attachments = [], replyTo } = data;

        // Vérifier que l'utilisateur fait partie de la conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          'participants.userId': socket.user._id
        });

        if (!conversation) {
          socket.emit('error', { message: 'Vous ne faites pas partie de cette conversation' });
          return;
        }

        // Créer le message
        const message = new Message({
          conversation: conversationId,
          sender: socket.user._id,
          content,
          messageType: messageType || 'text',
          attachments,
          replyTo,
          status: 'sent'
        });

        await message.save();

        // Populer le message avec les données de l'expéditeur
        await message.populate('sender', 'username profilePicture online lastSeen');
        if (replyTo) {
          await message.populate('replyTo');
        }

        // Mettre à jour la dernière message de la conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        // Émettre le message à tous les participants de la conversation
        io.to(conversationId).emit('newMessage', message);

        // Marquer le message comme délivré pour l'expéditeur
        socket.emit('messageDelivered', { messageId: message._id });

        console.log(`Message ${message._id} sent to conversation ${conversationId}`);

      } catch (error) {
        console.error('Error in newMessage event:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    /**
     * Événement: Message modifié
     * Émis par: Client lorsqu'un utilisateur modifie son message
     * Re-émit par: Serveur à tous les participants de la conversation
     */
    socket.on('editMessage', async (data) => {
      try {
        const { messageId, content } = data;

        // Trouver le message
        const message = await Message.findById(messageId)
          .populate('sender', 'username profilePicture');

        if (!message) {
          socket.emit('error', { message: 'Message non trouvé' });
          return;
        }

        // Vérifier que l'utilisateur est l'auteur du message
        if (message.sender._id.toString() !== socket.user._id) {
          socket.emit('error', { message: 'Non autorisé à modifier ce message' });
          return;
        }

        // Mettre à jour le message
        message.content = content;
        message.edited = true;
        message.updatedAt = new Date();
        await message.save();

        // Émettre le message mis à jour
        io.to(message.conversation.toString()).emit('messageUpdated', message);

        console.log(`Message ${messageId} updated by ${socket.user.username}`);

      } catch (error) {
        console.error('Error in editMessage event:', error);
        socket.emit('error', { message: 'Erreur lors de la modification du message' });
      }
    });

    /**
     * Événement: Message supprimé
     * Émis par: Client lorsqu'un utilisateur supprime son message
     * Re-émit par: Serveur à tous les participants de la conversation
     */
    socket.on('deleteMessage', async (data) => {
      try {
        const { messageId } = data;

        // Trouver le message
        const message = await Message.findById(messageId);

        if (!message) {
          socket.emit('error', { message: 'Message non trouvé' });
          return;
        }

        // Vérifier que l'utilisateur est l'auteur du message
        if (message.sender.toString() !== socket.user._id) {
          socket.emit('error', { message: 'Non autorisé à supprimer ce message' });
          return;
        }

        const conversationId = message.conversation.toString();

        // Supprimer le message
        await Message.findByIdAndDelete(messageId);

        // Émettre l'événement de suppression
        io.to(conversationId).emit('messageDeleted', {
          messageId,
          conversationId,
          deletedBy: socket.user._id
        });

        console.log(`Message ${messageId} deleted by ${socket.user.username}`);

      } catch (error) {
        console.error('Error in deleteMessage event:', error);
        socket.emit('error', { message: 'Erreur lors de la suppression du message' });
      }
    });

    /**
     * Événement: Message marqué comme lu
     * Émis par: Client lorsqu'un utilisateur lit un message
     * Re-émit par: Serveur à tous les participants de la conversation
     */
    socket.on('markAsRead', async (data) => {
      try {
        const { messageId } = data;

        // Trouver le message
        const message = await Message.findById(messageId);

        if (!message) {
          socket.emit('error', { message: 'Message non trouvé' });
          return;
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        const conversation = await Conversation.findOne({
          _id: message.conversation,
          'participants.userId': socket.user._id
        });

        if (!conversation) {
          socket.emit('error', { message: 'Vous ne faites pas partie de cette conversation' });
          return;
        }

        // Vérifier si le message n'a pas déjà été lu par cet utilisateur
        if (!message.readBy.includes(socket.user._id)) {
          message.readBy.push(socket.user._id);
          
          // Mettre à jour le statut
          if (message.readBy.length >= conversation.participants.length - 1) {
            message.status = 'read';
          } else {
            message.status = 'delivered';
          }
          
          await message.save();

          // Émettre l'événement de lecture
          io.to(message.conversation.toString()).emit('messageRead', {
            messageId: message._id,
            readerId: socket.user._id,
            readAt: new Date()
          });

          console.log(`Message ${messageId} marked as read by ${socket.user.username}`);
        }

      } catch (error) {
        console.error('Error in markAsRead event:', error);
        socket.emit('error', { message: 'Erreur lors du marquage comme lu' });
      }
    });

    /**
     * Événement: Message marqué comme délivré
     * Émis par: Client lorsqu'un message est délivré
     * Re-émit par: Serveur à l'expéditeur du message
     */
    socket.on('messageDelivered', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);

        if (!message) return;

        // Mettre à jour le statut du message
        if (message.status === 'sent') {
          message.status = 'delivered';
          await message.save();

          // Notifier l'expéditeur que le message a été délivré
          const senderSocketId = onlineUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageStatusUpdated', {
              messageId,
              status: 'delivered'
            });
          }
        }

      } catch (error) {
        console.error('Error in messageDelivered event:', error);
      }
    });
    

    // ==================== GESTION DE LA DÉCONNEXION ====================

    socket.on('disconnect', async (reason) => {
      try {
        console.log('User disconnected:', socket.user.userId.firstname, 'Reason:', reason);

        // Marquer l'utilisateur comme hors ligne
        await User.findByIdAndUpdate(socket.user.userId._id, {
          online: false,
          lastSeen: new Date()
        });

        // Retirer de la map des utilisateurs en ligne
        onlineUsers.delete(socket.user._id);

        // Notifier que l'utilisateur est hors ligne
        io.emit('userOffline', socket.user._id);

        // Nettoyer la saisie en cours
        const conversationId = typingUsers.get(socket.id);
        if (conversationId) {
          typingUsers.delete(socket.id);
          socket.to(conversationId).emit('userStopTyping', {
            userId: socket.user._id,
            conversationId
          });
        }

        console.log(`User ${socket.user.username} is now offline`);

      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    });

    /**
     * Événement: Déconnexion volontaire
     * Émis par: Client lorsque l'utilisateur se déconnecte manuellement
     */
    socket.on('logout', async () => {
      try {
        await User.findByIdAndUpdate(socket.user.userId._id, {
          online: false,
          lastSeen: new Date()
        });

        onlineUsers.delete(socket.user._id);
        io.emit('userOffline', socket.user._id);

        socket.disconnect(true);
        console.log(`User ${socket.user.username} logged out`);
      } catch (error) {
        console.error('Error during logout:', error);
      }
    });
  });
};
