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
        },
        birthday: {
            type: Date,
            enum: ['H', 'F'],
        },
        status: {
            type: String,
            enum: ['Pupil', 'Student', 'Other'],
            default: 'Pupil',
        },
        studyAt: {
            type: String,
        },
        domain: {
            type: String,
        },
        profilePicture: {
            publicId: {
                type: String,
            },
            url: {
                type: String,
            },
        },


        // Others Infos
        bio: {
            type: String,
            maxlength: 200,
        },
        coverPicture: {
            publicId: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        pins: [{type:mongoose.Types.ObjectId, ref: 'users'}],

        
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
