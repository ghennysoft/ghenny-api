import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParer from 'cookie-parser';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/Upload.js';
import MulterRoute from './Routes/Multer.js';

const app = express();
const port = 5000
dotenv.config()
const corsOptions = {
    AccessControlAllowOrigin: "*",
    origin: ["http://localhost:3000", "https://ghenny.onrender.com"],
    methods: ["GET", "PUT", "POST", "DELETE"],
}

// Middleware
app.use(cors(corsOptions))
app.use(bodyParser.json({limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))
app.use(cookieParer())
// Multer path
app.use(express.static('public'))


// mongoose.connect(process.env.MONGODB_LOCAL_URL)
mongoose.connect(process.env.MONGODB_PRODUCTION_URL)
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
app.use('/api', UploadRoute)
app.use('/api/local', MulterRoute)

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message,
    });
})

app.listen(port, () => {
    console.log(`Server connected at ${port}`)
})
