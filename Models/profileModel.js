import mongoose from "mongoose";

const ProfileSchema = mongoose.Schema(
    {
        // User id
        userId: {
            type:mongoose.Types.ObjectId, 
            ref: 'Users', 
            required: true,
        },

        // Complete Infos
        status: {
            type: String,
            enum: ['Pupil', 'Student', 'Other'],
        },

        school: {
            type: String,
        },
        option: {
            type: String,
        },
        school_start_year: {
            type: Number,
        },
        school_end_year: {
            type: Number,
        },

        university: {
            type: String,
        },
        filiere: {
            type: String,
        },
        university_start_year: {
            type: Number,
        },
        university_end_year: {
            type: Number,
        },

        entreprise: {
            type: String,
        },
        profession: {
            type: String,
        },
        
        
        // Others Infos
        gender: {
            type: String,
        },
        birthday: {
            type: Date,
        },
        profilePicture: {
            key: {
                type: String,
            },
            location: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        coverPicture: {
            key: {
                type: String,
            },
            location: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        bio: {
            type: String,
            maxlength: 200,
            default:'',
        },
        pins: [{type:mongoose.Types.ObjectId}],
        pinned: [{type:mongoose.Types.ObjectId}],
        subjects: [{type:mongoose.Types.ObjectId, ref: 'Subjects'}],
    },
    {timestamps: true},
)

const ProfileModel = mongoose.model("Profiles", ProfileSchema)
export default ProfileModel