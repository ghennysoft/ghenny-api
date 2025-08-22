import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config()

const authUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Auth Error" });
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = decoded?.user;
        next();
    } catch (err) { 
        res.status(401).json({ message: "Not authorized, token expired..." });
    }
}

export default authUser;
