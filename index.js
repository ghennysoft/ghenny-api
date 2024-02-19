import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';

const app = express();


// Middleware
app.use(bodyParser.json({limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))


// mongoose.connect('mongodb://localhost:27017/SocialMedia')
mongoose.connect('mongodb://localhost:27017/SocialMedia')
.then(() => app.listen(5000, () => console.log('Listening')))
.catch((error) => console.log(error));


// Usage of route
app.use('/auth', AuthRoute)
app.use('/user', UserRoute)
app.use('/post', PostRoute)
