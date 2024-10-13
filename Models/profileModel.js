import mongoose from "mongoose";

const ProfileSchema = mongoose.Schema(
    {
        // User Infos
        userId: {
            type:mongoose.Types.ObjectId, 
            ref: 'Users', 
            required: true,
        },

        // Complete Infos
        gender: {
            type: String,
        },
        birthday: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Pupil', 'Student', 'Other'],
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
            default:'',
        },
        coverPicture: {
            publicId: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        pins: [{type:mongoose.Types.ObjectId, ref: 'Users'}],
        subjects: {
            type: [],
        },
    },
    {timestamps: true},
)

const ProfileModel = mongoose.model("Profiles", ProfileSchema)
export default ProfileModel