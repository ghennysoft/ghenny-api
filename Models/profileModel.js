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
        schoolStartYear: {
            type: Number,
        },
        schoolEndYear: {
            type: Number,
        },

        university: {
            type: String,
        },
        filiere: {
            type: String,
        },
        universityStartYear: {
            type: Number,
        },
        universityEndYear: {
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
        profilePicture: String,
        coverPicture: String,
        bio: {
            type: String,
            maxlength: 200,
            default:'',
        },
        followings: [{type:mongoose.Types.ObjectId}],
        followers: [{type:mongoose.Types.ObjectId}],
        blockedProfiles: [{type:mongoose.Types.ObjectId}],
        subjects: [{type:mongoose.Types.ObjectId, ref: 'Subjects'}],
        isProfileCompleted: {
            type: Boolean,
            default: false
        },
    },
    {timestamps: true},
)

const ProfileModel = mongoose.model("Profiles", ProfileSchema)

// ProfileModel.collection.createIndex({school: 1});
// ProfileModel.collection.createIndex({option: 1});
// ProfileModel.collection.createIndex({university: 1});
// ProfileModel.collection.createIndex({filiere: 1});
// ProfileModel.collection.createIndex({school: 1, option: 1});
// ProfileModel.collection.createIndex({pins: 1});

export default ProfileModel