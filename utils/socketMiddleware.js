import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config()

const authSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log({TOKEN: token, SOCKET: socket});
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

export default authSocket;
