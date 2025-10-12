import mongoose from "mongoose";

const badgeSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, enum: ['participation', 'expertise', 'community', 'moderation'], default: 'participation' },
  criteria: {
    type: { type: String, required: true },
    threshold: { type: Number, required: true },
    condition: { type: String } // Conditions supplémentaires
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
}, { timestamps: true });

const badgeModel = mongoose.model("Badges", badgeSchema)
export default badgeModel