import UserModel from "../Models/userModel.js";


// Get a User
export const getUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await UserModel.findById(id);

        if(user){
            const {password, ...otherDetails} = user._doc
            res.status(200).json(otherDetails)
        }else{
            res.status(404).json("No such user exist")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}


// Update User
export const updateUser = async (req, res) => {
    const id = req.params.id;
    const {currentUserId} = req.body;

    if(id === currentUserId) {
        try {
            const user = await UserModel.findByIdAndUpdate(id, req.body, {new:true});
            res.status(201).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("Access Denied, you can only update your profile!")
    }
}


// Delete User
export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const {currentUserId} = req.body;

    if(id === currentUserId) {
        try {
            await UserModel.findByIdAndDelete(id);
            res.status(201).json("User Deleted Successfully")
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("Access Denied, you can only delete your profile!")
    }
}
