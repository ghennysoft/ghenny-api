import { Server } from 'socket.io';
import authSocket from './socketMiddleware.js';

let typingUsers = new Map();

export const setupSocket = (io) => {
  io.use(authSocket);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user?.userId?.username || 'Unknown user');

    // Vérification sécurisée des conversations
    if (socket.user && Array.isArray(socket.user.conversations)) {
      socket.user.conversations.forEach((conversationId) => {
        socket.join(conversationId.toString());
        console.log(`User joined conversation: ${conversationId}`);
      });
    }

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

    socket.on('disconnect', () => {
      const conversationId = typingUsers.get(socket.id);
      if (conversationId) {
        socket.to(conversationId).emit('userStopTyping', {
          userId: socket.user?.userId?.username,
          conversationId
        });
        typingUsers.delete(socket.id);
      }
      console.log('User disconnected:', socket.user?.userId?.username || 'Unknown user');
    });
  });
};












// import { Server } from 'socket.io';
// import authSocket from './socketMiddleware';

// let typingUsers = new Map();

// export const setupSocket = (io) => {
//   // Middleware d'authentification pour les sockets
//   io.use(authSocket);

//   io.on('connection', (socket) => {
//     console.log('User connected:', socket.user.username || 'Unknown user');

//     // Rejoindre les conversations de l'utilisateur
//     socket.user.conversations.forEach((conversationId) => {
//       socket.join(conversationId);
//     });

//     // Rejoindre une conversation spécifique
//     socket.on('joinConversation', (conversationId) => {
//       socket.join(conversationId);
//     });

//     // Quitter une conversation
//     socket.on('leaveConversation', (conversationId) => {
//       socket.leave(conversationId);
//     });

//     // Gestion de la saisie en cours
//     socket.on('typingStart', (data) => {
//       typingUsers.set(socket.id, data.conversationId);
//       socket.to(data.conversationId).emit('userTyping', {
//         userId: socket.user._id,
//         username: socket.user.username,
//         conversationId: data.conversationId
//       });
//     });

//     socket.on('typingStop', () => {
//       const conversationId = typingUsers.get(socket.id);
//       typingUsers.delete(socket.id);
//       if (conversationId) {
//         socket.to(conversationId).emit('userStopTyping', {
//           userId: socket.user._id,
//           conversationId
//         });
//       }
//     });

//     // Déconnexion
//     socket.on('disconnect', () => {
//       const conversationId = typingUsers.get(socket.id);
//       if (conversationId) {
//         socket.to(conversationId).emit('userStopTyping', {
//           userId: socket.user._id,
//           conversationId
//         });
//         typingUsers.delete(socket.id);
//       }
//       console.log('User disconnected');
//     });
//   });
// };