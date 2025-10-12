import mongoose from "mongoose";

const challengeSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['weekly', 'monthly', 'special'], required: true },
    criteria: {
        action: { type: String, required: true }, // 'answer_count', 'question_count', 'reputation_gain'
        target: { type: Number, required: true },
        timeframe: { type: String } // '24h', '7d', '30d'
    },
    reward: {
        points: { type: Number, default: 0 },
        badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badges' }
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profiles' },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
    }],
    isActive: { type: Boolean, default: true }
    }, { timestamps: true });

const challengeModel = mongoose.model("Challenges", challengeSchema)
export default challengeModel