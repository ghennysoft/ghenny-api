import mongoose, { Document, Schema } from 'mongoose'

const ConversationSchema = new Schema({
  type: { type: String, enum: ['private', 'group'], required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'Profiles', required: true }],
  groupName: String,
  groupAdmin: { type: Schema.Types.ObjectId, ref: 'Profiles' },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);