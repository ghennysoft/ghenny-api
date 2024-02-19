import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        // User Infos
        firstname: {
            type: String,
            required: true
        },
        postname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },

        // Profile Infos
        birthday: Date,
        city: String,
        bio: String,
        profilePicture: String,
        coverPicture: String,
        isAdmin: {
            type: Boolean,
            default: false
        },
    },
    {timestamps: true},
)

const UserModel = mongoose.model("Users", UserSchema)
export default UserModel
