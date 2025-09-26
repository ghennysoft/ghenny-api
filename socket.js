import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './utils/socket.js';

const app = express();
const server = createServer(app);

// Configuration CORS pour Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "http://localhost:5000", 
      "http://localhost:5001",  
      "https://ghenny.vercel.app"
    ],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true
  }
});

// Configuration des sockets
setupSocket(io);

export { app, server };