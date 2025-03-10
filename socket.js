import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        AccessControlAllowOrigin: "*",
        origin: ["http://localhost:3000", "https://ghenny.onrender.com"],
        methods: ["GET", "PUT", "POST", "DELETE"],
    }
})

let activeUsers = [];

io.on('connection', (socket)=>{
    // Add new user
    socket.on('newUser', (newUserId)=>{

        // if user is not added previously
        if(!activeUsers.some((user)=>user.userId===newUserId)){
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id 
            })
        }
        io.emit('getUsers', activeUsers)

        // Send message
        socket.on('sendMessage', (data)=>{
            const {receiverId} = data;
            const user = activeUsers.find((user)=>user.userId===receiverId)
            if(user){
                io.to(user.socketId).emit("receiveMessage", data.other)
            }
        });

        // Join group
        socket.on('joinGroup', (data)=>{
            const {groupId, userId} = data;
            console.log(`User ${userId} joined group ${groupId}`);
            socket.join(groupId);
        });

        // Leave group
        socket.on('leaveGroup', (data)=>{
            const {groupId, userId} = data;
            console.log(`User ${userId} left group ${groupId}`);
            socket.leave(groupId);
        });

    })

    socket.on('disconnect', ()=>{
        activeUsers=activeUsers.filter((user)=>user.socketId!==socket.id);
        io.emit('getUsers', activeUsers)
    })
})


export {app, io, server}