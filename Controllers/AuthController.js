import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import bcrypt from 'bcrypt'

export const registerUser = async (req, res) => {
    try {
        if(!req.body.username, !req.body.firstname, !req.body.lastname, !req.body.phone, !req.body.phone_code, !req.body.phone_code_2, !req.body.password){
            res.status(400).json("Veillez remplir tous les champs")
        } else {
            // Check if the username already exist
            const user_name = await UserModel.findOne({username: req.body.username})
            if(user_name) return res.status(400).json("Le nom d'utilisateur existe déjà")

            // Check the password length
            if(req.body.password.length < 6) res.status(400).json("Le mot de passe doit avoir au moins 6 caractères")
            
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(req.body.password, salt)
            const newUser = new UserModel({
                username: req.body.username,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                phone_code: req.body.phone_code,
                phone_code_2: req.body.phone_code_2,
                password: hashedPass,
            });

            const user_profile_exist = await ProfileModel.findOne({userId: newUser._id})
            if(user_profile_exist) return res.status(400).json("Le profile existe déjà")
            
            const newProfile = new ProfileModel({
                userId: newUser._id,
            });
            const user = await newUser.save();
            const profile = await newProfile.save();

            const user_profile = await ProfileModel.findOne({userId: newUser._id}).populate("userId", "-password")
            
            const access_token = createAccessToken({id: newProfile._id});
            const refresh_token = createRefreshToken({id: newProfile._id});

            res.cookie("refresh_token", refresh_token, {
                httpOnly: true,
                path: "/api/auth/refresh_token", 
                maxAge: 24*30*60*60*1000,    //30days
            })

            res.status(200).json({
                'profile': user_profile,
                'token': access_token,
            })
        } 
    }
    catch (err) {
        res.status(500).json(err)
        console.log(err);
    }
}


export const loginUser = async (req, res) => {  
    const {data, password} = req.body
    try {
        if(!data, !password){
          res.status(400).json({message: 'Remplissez tous les champs'})
        } else {
            let user;
            if(data.slice(0, 1) == '+') {
                user = await UserModel.findOne({ phone_code: data });
            } else if(data.slice(0, 2) == '00') {
                user = await UserModel.findOne({ phone_code_2: data });
            } else {
                user = await UserModel.findOne({ phone: data });
            }

            if(!user){
                res.status(400).json({message:'Numéro ou mot de passe incorrect' }) 
            } else {
                const auth = await bcrypt.compare(password,user.password)
                if (!auth) {
                    res.status(400).json({message:'Numéro ou mot de passe incorrect'})
                } else {
                    const profile = await ProfileModel.findOne({ userId: user._id }).populate('userId', '-password')
                    res.status(201).json({profile: profile });
                }
            }
        }
    } catch (err) {
        res.status(500).json(err)
        console.error(err);
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie('refresh_token', {path: "/api/auth/refresh_token"})
        res.json('Vous êtes deconnecté')
    } catch (err) {
        
    }
}


export const generateAccessToken = async (req, res) => {
    try {
        const rf_token = req.cookies.refresh_token;
        if(!rf_token) return res.status(400).json("Vous n'êtes pas connecté")
        jwt.verify(rf_token, process.env.REFRESH_TOKEN, async (err, result) => {
            if(err) return res.status(400).json("Vous n'êtes pas connecté")
            const profile = await ProfileModel.findById(result.id).populate('userId', '-password')
            
            if(!profile) return res.status(400).json("User doesn't exist")
            const access_token = createAccessToken({id: result.id})
            res.json(access_token, profile)
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
}
const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: "1d"})
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn: "30d"})
}


// studyAt suggestion
export const studyAtSearch = async (req, res) => {
    try {
        if(req.query.term.trim()){
            const study = await ProfileModel.find({studyAt: {$regex:  req.query.term, $options: "i"}}).select("studyAt -_id")
            res.status(200).json(study)
        } else {
            res.status(200).json([]) 
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// studyAt suggestion
export const domainSearch = async (req, res) => {
    try {
        if(req.query.term.trim()){
            const domain = await ProfileModel.find({domain: {$regex:  req.query.term, $options: "i"}}).select("domain -_id")
            res.status(200).json(domain)
        } else {
            res.status(200).json([]) 
        }
    } catch (error) {
        res.status(500).json(error)
    }
}