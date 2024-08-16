import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
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
        password: {
            type: String,
            required: true
        },


        // Complete Infos
        gender: {
            type: String,
            default: '',
        },
        birthday: {
            type: Date,
            default: '',
        },
        status: {
            type: String,
            default: '',
        },
        school: {
            type: String,
            default: '',
        },
        option: {
            type: String,
            default: '',
        },
        profilePicture: {
            type: String,
            default: '',
        },


        // Others Infos
        bio: {
            type: String,
            default: '',
            maxlength: 200,
        },
        coverPicture: {
            type: String,
            default: '',
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        pins: [{type:mongoose.Types.ObjectId, ref: 'users'}],

        
        // Location Infos
        city: {
            type: String,
            default: '',
        },
        country: {
            type: String,
            default: '',
        },
        continent: {
            type: String,
            default: '',
        },
    },
    {timestamps: true},
)

const UserModel = mongoose.model("Users", UserSchema)
export default UserModel
