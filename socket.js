import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

// Utilisation d'une Map pour de meilleures performances
const activeUsers = new Map();
const userGroups = new Map();

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://ghenny.vercel.app", "https://ghenny.onrender.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    pingInterval: 25000,
    pingTimeout: 60000
});

// Middleware d'authentification
io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        return next();
    }
    return next(new Error('Unauthorized'));
});

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Gestion des utilisateurs
    socket.on('newUser', (userId) => {
        activeUsers.set(userId, socket.id);
        console.log(`User ${userId} connected`);
        io.emit('getUsers', Array.from(activeUsers.keys()));
    });

    // Gestion des messages
    socket.on('sendMessage', (data) => {
        try {
            const { receiverId, content } = data;
            const receiverSocketId = activeUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', {
                    senderId: socket.userId,
                    content,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    // Gestion du typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing', { 
                userId: socket.userId, 
                isTyping 
            });
        }
    });

    // Gestion des groupes
    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        if (!userGroups.has(socket.userId)) {
            userGroups.set(socket.userId, new Set());
        }
        userGroups.get(socket.userId).add(groupId);
    });

    // Nettoyage à la déconnexion
    socket.on('disconnect', () => {
        for (let [userId, sockId] of activeUsers.entries()) {
            if (sockId === socket.id) {
                activeUsers.delete(userId);
                io.emit('getUsers', Array.from(activeUsers.keys()));
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
        
        // Nettoyer les groupes
        if (userGroups.has(socket.userId)) {
            userGroups.get(socket.userId).forEach(groupId => {
                socket.leave(groupId);
            });
            userGroups.delete(socket.userId);
        }
    });
});

export { app, io, server };