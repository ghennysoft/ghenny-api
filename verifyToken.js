import jwt from "jsonwebtoken"
import { createError } from "./error.js"

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token
    if(!token) return next(createError(401, "You are not authenticated"))

    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if(err) return next(createError(403, "Token is not valid"))
        req.user = user;
        next()
    })
}


//Save euth data in the Header and not Cookies
// const jwt = require("jsonwebtoken");
// var Article = require('../model/article.model');

// module.exports = { checkUser: function(req, res, next) {
//   const token = req.header("authorization");
//   if (!token) return res.status(401).json({ message: "Auth Error" });

//   try {
//     const decoded = jwt.verify(token, "randomString");
//     req.user = decoded.user;
//     next();
//   } catch (e) {
//     console.error(e);
//     res.status(500).send({ message: "Invalid Token" });
//   }
// }
// }