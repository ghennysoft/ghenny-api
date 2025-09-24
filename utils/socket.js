import { Server } from 'socket.io';
import authSocket from './socketMiddleware';

let typingUsers = new Map();

export const setupSocket = (io) => {
  // Middleware d'authentification pour les sockets
  // io.use(authSocket);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.username);

    // Rejoindre les conversations de l'utilisateur
    socket.user.conversations.forEach((conversationId) => {
      socket.join(conversationId);
    });

    // Rejoindre une conversation spécifique
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Quitter une conversation
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Gestion de la saisie en cours
    socket.on('typingStart', (data) => {
      typingUsers.set(socket.id, data.conversationId);
      socket.to(data.conversationId).emit('userTyping', {
        userId: socket.user._id,
        username: socket.user.username,
        conversationId: data.conversationId
      });
    });

    socket.on('typingStop', () => {
      const conversationId = typingUsers.get(socket.id);
      typingUsers.delete(socket.id);
      if (conversationId) {
        socket.to(conversationId).emit('userStopTyping', {
          userId: socket.user._id,
          conversationId
        });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      const conversationId = typingUsers.get(socket.id);
      if (conversationId) {
        socket.to(conversationId).emit('userStopTyping', {
          userId: socket.user._id,
          conversationId
        });
        typingUsers.delete(socket.id);
      }
      console.log('User disconnected');
    });
  });
};