import { Server } from 'socket.io';
import http from 'http';

// Ne pas créer une nouvelle app Express ici !
// Le `app` viendra d’index.js
let io;

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "https://ghenny.vercel.app", "https://ghenny.onrender.com"],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        },
        pingInterval: 25000,
        pingTimeout: 60000
    });

    const activeUsers = new Map();
    const userGroups = new Map();

    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        if (userId) {
            socket.userId = userId;
            return next();
        }
        return next(new Error('Unauthorized'));
    });

    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        socket.on('newUser', (userId) => {
            activeUsers.set(userId, socket.id);
            console.log(`User ${userId} connected`);
            io.emit('getUsers', Array.from(activeUsers.keys()));
        });

        socket.on('sendMessage', (data) => {
            const { receiverId, content } = data;
            const receiverSocketId = activeUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', {
                    senderId: socket.userId,
                    content,
                    timestamp: new Date()
                });
            }
        });

        socket.on('typing', ({ receiverId, isTyping }) => {
            const receiverSocketId = activeUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing', {
                    userId: socket.userId,
                    isTyping
                });
            }
        });

        socket.on('joinGroup', (groupId) => {
            socket.join(groupId);
            if (!userGroups.has(socket.userId)) {
                userGroups.set(socket.userId, new Set());
            }
            userGroups.get(socket.userId).add(groupId);
        });

        socket.on('disconnect', () => {
            for (let [userId, sockId] of activeUsers.entries()) {
                if (sockId === socket.id) {
                    activeUsers.delete(userId);
                    io.emit('getUsers', Array.from(activeUsers.keys()));
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }

            if (userGroups.has(socket.userId)) {
                userGroups.get(socket.userId).forEach(groupId => {
                    socket.leave(groupId);
                });
                userGroups.delete(socket.userId);
            }
        });
    });
};

export { setupSocket };