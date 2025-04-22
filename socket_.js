import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://ghenny.vercel.app", "https://ghenny.onrender.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
})

const activeUsers = new Map();

// Backend
// const emitNotificationToFollowers = (followers, notification) => {
//     followers.forEach(follower => {
//       io.to(follower._id.toString()).emit('notification', notification);
//     });
//   };
  
//   // Lors de la création d'un post
//   emitNotificationToFollowers(followers, {
//     type: 'new_post',
//     message: `${user.username} a publié un nouveau post.`,
//   });
  

io.on('connection', (socket)=>{
    // Add new user
    socket.on('newUser', (userId)=>{
        // if user is not added previously
        if(!activeUsers.some((user)=>user.userId===userId)){
            activeUsers.set(userId, socket.id);
        }
        io.emit('getUsers', Array.from(activeUsers.keys()))
    })
    // socket.on('newUser', (userId) => {
    //     activeUsers.set(userId, socket.id);
    //     io.emit('getUsers', Array.from(activeUsers.keys()));
    // });

    // Send message
    socket.on('sendMessage', (data)=>{
        const {receiverId} = data;
        const user = activeUsers.find((user)=>user.userId===receiverId)
        if(user){
            io.to(user.socketId).emit("receiveMessage", data.other)
        }
    });

    // Is Typing message
    socket.on('isTypingMessage', (data)=>{
        const {profile} = data;
        
        const user = activeUsers.find((user)=>user.userId===profile)
        if(user){
            io.to(user.socketId).emit("isTypingMessage")
        }
    });

    // Stop Typing message
    socket.on('stopTypingMessage', (data)=>{
        const {profile} = data;

        const user = activeUsers.find((user)=>user.userId===profile)  
        if(user){
            io.to(user.socketId).emit("stopTypingMessage")
        }
    });

    // Join group
    // socket.on('joinGroup', (data)=>{
    //     const {groupId, userId} = data;
    //     console.log(`User ${userId} joined group ${groupId}`);
    //     socket.join(groupId);
    // });
    socket.on('joinGroup', ({ groupId, userId }) => {
        socket.join(groupId);
        // Stockez les groupes par utilisateur
        if (!userGroups.has(userId)) {
            userGroups.set(userId, new Set());
        }
        userGroups.get(userId).add(groupId);
    });
    
    // Pour envoyer à un groupe
    io.to(groupId).emit('groupMessage', data);

    // Leave group
    socket.on('leaveGroup', (data)=>{
        const {groupId, userId} = data;
        console.log(`User ${userId} left group ${groupId}`);
        socket.leave(groupId);
    });

    // socket.on('disconnect', ()=>{
    //     activeUsers=activeUsers.filter((user)=>user.socketId!==socket.id);
    //     io.emit('getUsers', activeUsers)
    // })
    socket.on('disconnect', () => {
        for (let [userId, sockId] of activeUsers.entries()) {
            if (sockId === socket.id) {
                activeUsers.delete(userId);
                break;
            }
        }
        io.emit('getUsers', Array.from(activeUsers.keys()));
    });
})


export {app, io, server}