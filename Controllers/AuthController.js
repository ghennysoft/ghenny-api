import UserModel from "../Models/userModel.js";


export const registerUser = async (req, res) => {
    const {firstname, postname, lastname, email, phone, password} = req.body;
    
    try {
        const newUser = new UserModel({firstname, postname, lastname, email, phone, password});
        await newUser.save()
        res.status(200).json(newUser)
    } catch (error) {
        res.status(500).json({message: error.message})
    }

}


export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    
    try {
        const user = await UserModel.findOne({email:email})
        
        if(user) {
            password==user.password ? res.status(200).json(user) : res.status(400).json({message: 'Wrong password'})
        } else {
            res.status(400).json({message: "User doesn't exist"})
        }

    } catch (error) {
        res.status(500).json({message: error.message})
    }

}