import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        // Profile id
        profileId: {
            type:mongoose.Types.ObjectId, 
            ref: 'Profiles', 
            // required: true,
        },

        // User Infos
        username: {
            type: String,
            trim: true,
            unique: true,
        },
        firstname: {
            type: String,
            required: true,
            trim: true,
        },
        lastname: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: true
        },
        phone_code: {
            type: String,
            required: true
        },
        phone_code_2: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },


        // Others Infos
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        
        // Location Infos
        city: {
            type: String,
        },
        country: {
            type: String,
        },
        continent: {
            type: String,
        },
    },
    {timestamps: true},
)

const UserModel = mongoose.model("Users", UserSchema)
export default UserModel