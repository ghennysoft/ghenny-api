import jwt from 'jsonwebtoken';

export const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: process.env.JWT_EXPIRES_IN})
}

export const createRefreshToken = () => {
    return jwt.sign({}, process.env.REFRESH_TOKEN, {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN})
}