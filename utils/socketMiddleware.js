import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
    
    if (!token) {
      console.log('No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    socket.user = decoded?.user;
    console.log('User authenticated:', socket?.user?.userId?.firstname+' '+socket?.user?.userId?.lastname);
    next();
  } catch (error) {
    console.log('Authentication failed:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

export default authSocket;