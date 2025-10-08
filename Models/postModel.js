import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    author:{
        type: mongoose.Types.ObjectId, 
        ref: 'Profiles', 
        required: true,
    },
    content: String,
    media: [{
        url: String,
        type: {
            type: String,
            enum: ['image', 'video', 'document']
        }
    }],
    postBg: {
        img: {
            type: String
        },
        color: {
            type: String
        },
    },
    postType: {
        type: String,
        enum: ['user', 'page', 'group'],
        default: 'user'
    },
    target: {
        // Référence à la Page ou Groupe
        type: mongoose.Schema.Types.ObjectId,
        required: function() {
            return this.postType !== 'user';
        }
    },
    visibility: {
        type: String,
        enum: ['public', 'friends', 'group_members', 'page_followers'],
        default: 'public'
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profiles'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    shares: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['published', 'pending', 'rejected'],
        default: 'published'
    },
    deleted: [{
        state: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{type:mongoose.Types.ObjectId, ref: 'Comments'}],
},
{
    timestamps: true
});

const PostModel = mongoose.model("Posts", postSchema)
export default PostModel
