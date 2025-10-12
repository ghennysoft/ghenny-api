import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profiles',
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'text'],
        required: true
    },
    mediaUrl: {
        type: String
    },
    textContent: {
        type: String
    },
    backgroundColor: {
        type: String,
        default: '#000000'
    },
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profiles'
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        index: { expires: '24h' }
    }
}, {
    timestamps: true
});

const StoryModel = mongoose.model("Stories", storySchema)
export default StoryModel