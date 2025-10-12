import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import { app, server } from './socket.js';

import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/ProfileRoute.js';
import PostRoute from './Routes/PostRoute.js';
import StoryRoute from './Routes/StoryRoute.js';
import QuestionRoute from './Routes/QuestionRoute.js';
import AnswerRoute from './Routes/AnswerRoute.js';
import CommentRoute from './Routes/CommentRoute.js';
import ChatRoute from './Routes/ChatRoute.js';
import ConversationRoute from './Routes/ConversationRoutes.js';
import MessageRoute from './Routes/MessageRoute.js';
import NotificationRoute from './Routes/NotificationRoute.js';
import PageRoute from './Routes/PageRoute.js';

dotenv.config();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        "http://localhost:3000", 
        "http://localhost:5000",
        "https://ghenny.vercel.app",
        "https://ghenny.com",
        "https://www.ghenny.com",
    ],
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(express.static('public'));
// app.use(bodyParser.json({limit: '30mb', extended: true}))
// app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))

let MONGO_URL;

if(process.env.NODE_ENV == 'developpement') {
    MONGO_URL = mongoose.connect(process.env.MONGODB_LOCAL_URL, {
        serverSelectionTimeoutMS: 30000, // 30s au lieu de 10s
    });
    console.log('On developpment');
} else if(process.env.NODE_ENV == 'test') {
    MONGO_URL = mongoose.connect(process.env.MONGODB_TEST_URL, {
        serverSelectionTimeoutMS: 30000, // 30s au lieu de 10s
    });
    console.log('On test');
} else {
    MONGO_URL = mongoose.connect(process.env.MONGODB_PRODUCTION_URL, {
        serverSelectionTimeoutMS: 30000, // 30s au lieu de 10s
    });
    console.log('On production');
}

MONGO_URL
.then(() => {
    console.log('DB Connected');
})
.catch((error) => {
    throw error
});

// Usage of route
app.use('/api/auth', AuthRoute)
app.use('/api/profile', UserRoute)
app.use('/api/post', PostRoute)
app.use('/api/story', StoryRoute)
app.use('/api/comment', CommentRoute)
app.use('/api/question', QuestionRoute)
app.use('/api/answer', AnswerRoute)
app.use('/api/chat', ChatRoute)
app.use('/api/conversation', ConversationRoute)
app.use('/api/message', MessageRoute)
app.use('/api/notification', NotificationRoute)
app.use('/api/page', PageRoute)

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message,
    });
})

server.listen(port, () => {
    console.log(`Server connected at ${port}`)
})