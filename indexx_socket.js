import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/ProfileRoute.js';
import PostRoute from './Routes/PostRoute.js';
import QuestionRoute from './Routes/QuestionRoute.js';
import AnswerRoute from './Routes/AnswerRoute.js';
import CommentRoute from './Routes/CommentRoute.js';
import ChatRoute from './Routes/ChatRoute.js';
import NotificationRoute from './Routes/NotificationRoute.js';

import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // Serveur HTTP avec app

const port = process.env.PORT || 5000;

const corsOptions = {
    AccessControlAllowOrigin: "*",
    origin: ["http://localhost:3000", "https://ghenny.vercel.app", "https://ghenny.onrender.com"],
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/profile', UserRoute);
app.use('/api/post', PostRoute);
app.use('/api/comment', CommentRoute);
app.use('/api/question', QuestionRoute);
app.use('/api/answer', AnswerRoute);
app.use('/api/chat', ChatRoute);
app.use('/api/notification', NotificationRoute);

// Gestion des erreurs
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({ success: false, status, message });
});

// Connexion à la DB
mongoose.connect(process.env.MONGODB_LOCAL_URL, {
    serverSelectionTimeoutMS: 30000,
})
// mongoose.connect(process.env.MONGODB_PRODUCTION_URL, {
//     serverSelectionTimeoutMS: 30000,
// })
.then(() => {
    console.log('DB Connected');
}).catch((error) => {
    throw error;
});

// Setup de Socket.IO
setupSocket(server);

// Lancement du serveur
server.listen(port, () => {
    console.log(`Server connected at port ${port}`);
});











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