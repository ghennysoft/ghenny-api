import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import bcrypt from 'bcrypt'
import twilio from "twilio";
import {createAccessToken, createRefreshToken} from "../utils/jwtTokens.js"


export const registerUser = async (req, res) => {
    try {
        if(!req.body.username, !req.body.firstname, !req.body.lastname, !req.body.phone, !req.body.phone_code, !req.body.phone_code_2, !req.body.password, !req.body.confirmPassword){
            res.status(400).json("Veillez remplir tous les champs")
        } else if(req.body.password !== req.body.confirmPassword){
            res.status(400).json("Le mot de passe de confirmation est different")
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
                
                city: req.body.city,
                region: req.body.region,
                country: req.body.country,
                continent: req.body.continent,
            });

            const user_profile_exist = await ProfileModel.findOne({userId: newUser._id})
            if(user_profile_exist) return res.status(400).json("Le profile existe déjà")
            
            const newProfile = new ProfileModel({
                userId: newUser._id,
            });

            await newUser.save();
            await newProfile.save();
            
            const profileToken = await ProfileModel.findOne({ userId: newUser._id })
            .select('birthday gender status option school userId')
            .populate('userId', 'username firstname lastname phone_code')
            
            const access_token = createAccessToken({user: profileToken});
            const refresh_token = createRefreshToken();
            
            newUser.refreshTokens.push(refresh_token);
            await newUser.save();

            res.status(201).json({
                'profile': profileToken,
                'token': access_token,
                'refreshToken': refresh_token,
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

                    const profileToken = await ProfileModel.findOne({ userId: user._id })
                    .select('birthday gender status option school userId')
                    .populate('userId', 'username firstname lastname phone_code')
                    
                    const access_token = createAccessToken({user: profileToken});
                    const refresh_token = createRefreshToken();

                    user.refreshTokens.push(refresh_token);
                    await user.save();
                    
                    res.status(200).json({
                        'profile': profileToken,
                        'token': access_token,
                        'refreshToken': refresh_token,
                    })
                }
            }
        }
    
    } catch (err) {
        res.status(500).json(err)
        console.error(err);
    }
}

export const generateRefreshToken = async (req, res) => {

    try {
        const { refreshToken } = req.body;
        const user = await UserModel.findOne({ refreshTokens: refreshToken });
        
        if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

        const profileToken = await ProfileModel.findOne({ userId: user._id })
            .select('birthday gender status option school userId')
            .populate('userId', 'username firstname lastname phone_code')
            
        const new_access_token = createAccessToken({user: profileToken});

        res.json({ 
            'token': new_access_token,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const searchUser = async (req, res) => {
    const searchTerm = req.query.q || ''
    
    try {
        // Search user
        const searchParts = searchTerm.split(' ').map(part => part.trim()).filter(part => part.length > 0);

        let profiles = [];

        if (searchParts.length === 1) {
            // Recherche par prénom ou nom seul
            profiles = await UserModel.find({
                $or: [
                    { firstname: { $regex: searchParts[0], $options: 'i' } },
                    { lastname: { $regex: searchParts[0], $options: 'i' } }
                ]
            })
            .select('username firstname lastname')
            .populate('profileId', 'profilePicture')
        } else if (searchParts.length === 2) {
            // Recherche avec prénom + nom ou nom + prénom
            const [part1, part2] = searchParts;
      
            profiles = await UserModel.find({
              $or: [
                {
                  firstname: { $regex: part1, $options: 'i' },
                  lastname: { $regex: part2, $options: 'i' }
                },
                {
                  firstname: { $regex: part2, $options: 'i' },
                  lastname: { $regex: part1, $options: 'i' }
                }
              ]
            })
            .select('username firstname lastname')
            .populate('profileId', 'profilePicture')
        }

        res.status(200).json(profiles)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const getUser = async (req, res) => {
    const paramId = req.params.id;
    try {
        const user = await UserModel.findOne({username: paramId})
        .select('username email firstname lastname phone');

        if(user){
            res.status(200).json(user)
        }else{
            res.status(404).json("No such user exist")
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refresh_token', {maxAge: 0, path: "/api/auth/refresh_token"})
        res.status(200).json('Vous êtes deconnecté')
    } catch (err) {
        
    }
}

export const completeProfileSuggestions = async (req, res) => {
    try {
        const studyAt = await ProfileModel.distinct('studyAt')
        const domain = await ProfileModel.distinct('domain')
        res.status(200).json({studyAt, domain})
    } catch (error) {
        res.status(500).json(error)
    }
}



const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
let tempOTPs = {};

export const sendOTP = async (req, res) => {
    const {phone} = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    tempOTPs[phone] = otp;
    try {
        await client.messages.create({
            body: `Votre code OPT est: ${otp}`,
            from: process.env.TWILIO_PHONE,
            to: phone,
        });
        res.status(200).json({success: true});
    } catch (error) {
        res.status(500).json(error);
    }
}

export const verifyOTP = async (req, res) => {
    const {phone, otp} = req.body;
    if(tempOTPs[phone] && tempOTPs[phone] === otp) {
        delete tempOTPs[phone];
        res.status(200).json({success: true})
    } else {
        res.status(400).json({error: "OTP Invalide"});
    }
}

// From user-services
const sendResetCode = async (req, res) => {
  try {
    const { userId, method } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur est non trouvé' });
    }

    // Générer un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker le code dans Redis avec une expiration
    await redisClient.setEx(
      `resetCode:${userId}`,
      resetCode,
      'EX',
      900 // 15 minutes en secondes
    );

    // Envoyer le code par email ou SMS selon la méthode choisie
    if (method === 'email') {
      await sendResetPasswordEmail(user.email, resetCode);
    } else if (method === 'sms') {
      await sendResetPasswordSMS(user.phoneNumber, resetCode);
    }

    res.json({ message: 'Code de réinitialisation envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du code de réinitialisation' });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    // // Vérifier le code dans Redis
    // const storedCode = await redisClient.get(`resetCode:${userId}`);
    
    // if (!storedCode || storedCode !== code) {
    //   return res.status(400).json({ message: 'Code invalide ou expiré' });
    // }

    // Générer un token temporaire pour la réinitialisation
    const resetToken = jwt.sign(
      { userId, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Supprimer le code de Redis
    // await redisClient.del(`resetCode:${userId}`);

    res.json({ resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur est non trouvé' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
